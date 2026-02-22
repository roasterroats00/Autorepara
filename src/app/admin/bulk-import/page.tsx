'use client';

// AI Enrichment Queue System for Bulk Import
import { useState, useRef, useCallback, useEffect } from 'react';

// Types
interface EnrichmentOptions {
    generateDescriptions: boolean;
    generateSeo: boolean;
    generateFaq: boolean;
    translateToSpanish: boolean;
}

interface ProcessingLog {
    workshopName: string;
    success: boolean;
    error?: string;
    timestamp: Date;
}

interface QueueStatus {
    jobId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'paused';
    totalRows: number;
    processedRows: number;
    successfulRows: number;
    failedRows: number;
    currentRowIndex: number;
    estimatedTimeRemaining: number;
}

type CsvRow = Record<string, string>;

export default function BulkImportPage() {
    const [file, setFile] = useState<File | null>(null);
    const [step, setStep] = useState(1);
    const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
    const [csvData, setCsvData] = useState<CsvRow[]>([]);
    const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
    const [importJobId, setImportJobId] = useState<string | null>(null);
    const [isImporting, setIsImporting] = useState(false);

    // Enrichment state
    const [enrichmentOptions, setEnrichmentOptions] = useState<EnrichmentOptions>({
        generateDescriptions: true,
        generateSeo: true,
        generateFaq: true,
        translateToSpanish: true,
    });
    const [isEnriching, setIsEnriching] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
    const [processingLogs, setProcessingLogs] = useState<ProcessingLog[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const enrichmentLoopRef = useRef<boolean>(false);

    // System fields to map - matches all columns from Google Maps CSV data
    const systemFields = [
        // Basic Info
        { key: 'name', label: 'Business Name (title)', required: true },
        { key: 'description', label: 'Description', required: false },
        { key: 'category', label: 'Category', required: false },

        // Contact
        { key: 'phone', label: 'Phone', required: false },
        { key: 'website', label: 'Website (url)', required: false },

        // Location - Full Address
        { key: 'address', label: 'Full Address', required: true },
        { key: 'city', label: 'City (address_info_city)', required: false },
        { key: 'state', label: 'State (address_info_region)', required: false },
        { key: 'zipCode', label: 'ZIP Code (address_info_zip)', required: false },

        // Coordinates
        { key: 'latitude', label: 'Latitude', required: false },
        { key: 'longitude', label: 'Longitude', required: false },

        // Images
        { key: 'logo', label: 'Logo URL', required: false },
        { key: 'mainImage', label: 'Main/Featured Image URL', required: false },

        // Rating & Reviews (JSON)
        { key: 'rating', label: 'Rating (JSON with value/votes_count)', required: false },

        // Business Hours (JSON)
        { key: 'workTime', label: 'Work Hours (work_time JSON)', required: false },

        // Contact Info (JSON array)
        { key: 'contactInfo', label: 'Contact Info (JSON with phone)', required: false },

        // Additional
        { key: 'attributes', label: 'Attributes (accessibility, payments)', required: false },
        { key: 'placeTopics', label: 'Place Topics/Keywords', required: false },
    ];

    // Parse CSV file
    const parseCSV = (text: string): { headers: string[], data: CsvRow[] } => {
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length === 0) return { headers: [], data: [] };

        // Parse header row
        const headers = parseCSVLine(lines[0]);

        // Parse data rows
        const data: CsvRow[] = [];
        for (let i = 1; i < lines.length; i++) {
            const values = parseCSVLine(lines[i]);
            const row: CsvRow = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            data.push(row);
        }

        return { headers, data };
    };

    // Parse a single CSV line handling quoted values
    const parseCSVLine = (line: string): string[] => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());

        return result;
    };

    // Handle file change
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);

            // Parse CSV
            const text = await selectedFile.text();
            const { headers, data } = parseCSV(text);

            setCsvHeaders(headers);
            setCsvData(data);

            // Auto-map columns based on CSV header names (Google Maps format)
            const autoMapping: Record<string, string> = {};

            // Specific mappings for Google Maps CSV columns
            const specificMappings: Record<string, string[]> = {
                'name': ['title', 'name', 'business_name'],
                'description': ['description'],
                'category': ['category', 'type'],
                'phone': ['phone'],
                'website': ['url', 'website', 'web'],
                'address': ['address', 'full_address'],
                'city': ['address_info_city', 'city'],
                'state': ['address_info_region', 'state', 'region'],
                'zipCode': ['address_info_zip', 'zip', 'postal_code'],
                'latitude': ['latitude', 'lat'],
                'longitude': ['longitude', 'lng', 'long'],
                'logo': ['logo', 'logo_url'],
                'mainImage': ['main_image', 'featured_image', 'image'],
                'rating': ['rating'],
                'workTime': ['work_time', 'hours', 'business_hours'],
                'contactInfo': ['contact_info', 'contacts'],
                'attributes': ['attributes'],
                'placeTopics': ['place_topics', 'topics', 'keywords'],
            };

            headers.forEach(header => {
                const headerLower = header.toLowerCase();
                for (const [fieldKey, possibleNames] of Object.entries(specificMappings)) {
                    if (possibleNames.some(name => headerLower === name || headerLower.includes(name))) {
                        if (!autoMapping[fieldKey]) { // Don't overwrite if already mapped
                            autoMapping[fieldKey] = header;
                        }
                    }
                }
            });

            setColumnMapping(autoMapping);
            console.log('Auto-mapped columns:', autoMapping);

            setStep(2);
        }
    };

    // Start import - save data to database
    const startImport = async () => {
        setStep(3);
        setIsImporting(true);

        try {
            // Call API to create import job and save workshops
            const response = await fetch('/api/import', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    csvData: csvData,
                    columnMapping: columnMapping,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create import job');
            }

            const result = await response.json();

            // Store the real job ID from database
            setImportJobId(result.jobId);

            // Wait a moment to show import in progress
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Move to enrichment step with real job data
            setQueueStatus({
                jobId: result.jobId,
                status: 'pending',
                totalRows: result.totalRows || csvData.length,
                processedRows: 0,
                successfulRows: 0,
                failedRows: 0,
                currentRowIndex: 0,
                estimatedTimeRemaining: (result.totalRows || csvData.length) * 3,
            });

            setStep(4);
        } catch (error) {
            console.error('Import failed:', error);
            alert('Failed to import data. Please try again.');
            setStep(2); // Go back to mapping
        } finally {
            setIsImporting(false);
        }
    };

    // Process single row enrichment
    const processNextRow = useCallback(async () => {
        if (!importJobId || !queueStatus) return false;

        try {
            const response = await fetch(`/api/import/enrich/${importJobId}/process-next`, {
                method: 'POST',
            });

            const result = await response.json();

            // Add to processing log
            setProcessingLogs(prev => [...prev, {
                workshopName: result.workshopName || 'Unknown',
                success: result.success,
                error: result.error,
                timestamp: new Date(),
            }].slice(-50)); // Keep last 50 logs

            // Update queue status
            setQueueStatus(prev => prev ? {
                ...prev,
                processedRows: result.progress.current,
                successfulRows: prev.successfulRows + (result.success ? 1 : 0),
                failedRows: prev.failedRows + (result.success ? 0 : 1),
                currentRowIndex: result.progress.current,
                estimatedTimeRemaining: (prev.totalRows - result.progress.current) * 3,
                status: result.hasMoreRows ? 'processing' : 'completed',
            } : null);

            return result.hasMoreRows;
        } catch (error) {
            console.error('Error processing row:', error);
            return false;
        }
    }, [importJobId, queueStatus]);

    // Enrichment loop
    const runEnrichmentLoop = useCallback(async () => {
        enrichmentLoopRef.current = true;
        setIsEnriching(true);
        setIsPaused(false);

        // Start enrichment on server
        await fetch('/api/import/enrich', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jobId: importJobId, action: 'start' }),
        });

        setQueueStatus(prev => prev ? { ...prev, status: 'processing' } : null);

        while (enrichmentLoopRef.current) {
            const hasMore = await processNextRow();

            if (!hasMore) {
                break;
            }

            // Wait 2 seconds between requests (rate limiting)
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        setIsEnriching(false);
    }, [importJobId, processNextRow]);

    // Pause enrichment
    const pauseEnrichment = async () => {
        enrichmentLoopRef.current = false;
        setIsPaused(true);
        setIsEnriching(false);

        await fetch('/api/import/enrich', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jobId: importJobId, action: 'pause' }),
        });

        setQueueStatus(prev => prev ? { ...prev, status: 'paused' } : null);
    };

    // Resume enrichment
    const resumeEnrichment = async () => {
        await fetch('/api/import/enrich', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jobId: importJobId, action: 'resume' }),
        });

        runEnrichmentLoop();
    };

    // Retry failed enrichments
    const retryFailed = async () => {
        if (!importJobId) return;

        try {
            setIsEnriching(true);
            setIsPaused(false);

            setProcessingLogs(prev => [...prev, {
                workshopName: 'System',
                success: true,
                timestamp: new Date()
            }]);

            const response = await fetch(`/api/import/enrich/${importJobId}/retry`, {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Failed to retry enrichments');
            }

            const result = await response.json();

            setProcessingLogs(prev => [...prev, {
                workshopName: 'System',
                success: true,
                timestamp: new Date()
            }]);

            // Restart enrichment loop
            runEnrichmentLoop();

        } catch (error) {
            console.error('Retry failed error:', error);
            setProcessingLogs(prev => [...prev, {
                workshopName: 'Retry Failed',
                success: false,
                error: 'Failed to retry enrichments. Please try again.',
                timestamp: new Date()
            }]);
            setIsEnriching(false);
        }
    };

    // Format time remaining
    const formatTimeRemaining = (seconds: number): string => {
        if (seconds < 60) return `${seconds}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
        return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            enrichmentLoopRef.current = false;
        };
    }, []);

    // Steps configuration
    const steps = [
        { num: 1, label: 'Upload' },
        { num: 2, label: 'Map Columns' },
        { num: 3, label: 'Import' },
        { num: 4, label: 'AI Enrichment' },
    ];

    return (
        <>
            <h1 className="text-2xl font-bold text-white mb-8">Bulk Import Workshops</h1>

            {/* Steps */}
            <div className="flex items-center gap-2 mb-8 flex-wrap">
                {steps.map((s, i) => (
                    <div key={s.num} className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s.num ? 'bg-mf-green text-mf-dark' : 'bg-[#26342b] text-gray-400'
                            }`}>
                            {step > s.num ? '✓' : s.num}
                        </div>
                        <span className={`${step >= s.num ? 'text-white' : 'text-gray-500'} text-sm`}>
                            {s.label}
                        </span>
                        {i < steps.length - 1 && <div className="w-8 h-0.5 bg-[#26342b]" />}
                    </div>
                ))}
            </div>

            {/* Step 1: Upload */}
            {step === 1 && (
                <div className="bg-mf-card rounded-xl p-8">
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-[#26342b] rounded-xl p-12 text-center cursor-pointer hover:border-mf-green/50 transition-colors"
                    >
                        <span className="material-symbols-outlined text-5xl text-gray-500 mb-4">cloud_upload</span>
                        <h3 className="text-white font-semibold mb-2">Upload CSV File</h3>
                        <p className="text-gray-400 text-sm mb-4">Drag and drop or click to browse</p>
                        <p className="text-gray-500 text-xs">Supports CSV files up to 10MB</p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>
                </div>
            )}

            {/* Step 2: Map Columns */}
            {step === 2 && file && (
                <div className="bg-mf-card rounded-xl p-8">
                    <div className="flex items-center gap-4 mb-6">
                        <span className="material-symbols-outlined text-mf-green text-3xl">check_circle</span>
                        <div>
                            <h3 className="text-white font-semibold">{file.name}</h3>
                            <p className="text-gray-400 text-sm">
                                {(file.size / 1024).toFixed(1)} KB • {csvData.length} rows • {csvHeaders.length} columns
                            </p>
                        </div>
                    </div>

                    <h3 className="text-white font-semibold mb-4">Map CSV Columns to System Fields</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                        {systemFields.map((field) => (
                            <div key={field.key} className="flex items-center gap-4">
                                <label className="w-32 text-gray-400 text-sm">
                                    {field.label}
                                    {field.required && <span className="text-red-400">*</span>}
                                </label>
                                <select
                                    className="flex-1 bg-mf-dark border border-[#26342b] rounded-lg px-4 py-2 text-white text-sm"
                                    value={columnMapping[field.key] || ''}
                                    onChange={(e) => setColumnMapping(prev => ({
                                        ...prev,
                                        [field.key]: e.target.value
                                    }))}
                                >
                                    <option value="">Select column...</option>
                                    {csvHeaders.map((header) => (
                                        <option key={header} value={header}>{header}</option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>

                    {/* Preview */}
                    <div className="mt-6">
                        <h4 className="text-white font-semibold mb-2">Preview (first 3 rows)</h4>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-[#26342b]">
                                        {systemFields.filter(f => columnMapping[f.key]).map(f => (
                                            <th key={f.key} className="text-left py-2 px-3 text-gray-400">{f.label}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {csvData.slice(0, 3).map((row, i) => (
                                        <tr key={i} className="border-b border-[#26342b]/50">
                                            {systemFields.filter(f => columnMapping[f.key]).map(f => (
                                                <td key={f.key} className="py-2 px-3 text-gray-300 truncate max-w-[200px]">
                                                    {row[columnMapping[f.key]] || '-'}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-8">
                        <button
                            onClick={() => setStep(1)}
                            className="px-6 py-2 bg-[#26342b] text-white rounded-lg hover:bg-[#2f3e2b]"
                        >
                            Back
                        </button>
                        <button
                            onClick={startImport}
                            disabled={!columnMapping.name || !columnMapping.address || !columnMapping.city}
                            className="px-6 py-2 bg-mf-green text-mf-dark font-semibold rounded-lg hover:bg-mf-green-hover disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Start Import ({csvData.length} rows)
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Import Progress */}
            {step === 3 && (
                <div className="bg-mf-card rounded-xl p-8 text-center">
                    <span className="material-symbols-outlined text-mf-green text-6xl mb-4 animate-spin">sync</span>
                    <h3 className="text-white font-semibold text-xl mb-2">Importing Data...</h3>
                    <p className="text-gray-400">Saving {csvData.length} workshops to database.</p>
                    <div className="mt-8 bg-[#26342b] rounded-full h-2 max-w-md mx-auto">
                        <div className="bg-mf-green h-2 rounded-full w-1/2 animate-pulse" />
                    </div>
                </div>
            )}

            {/* Step 4: AI Enrichment */}
            {step === 4 && queueStatus && (
                <div className="space-y-6">
                    {/* Enrichment Options */}
                    {!isEnriching && queueStatus.status === 'pending' && (
                        <div className="bg-mf-card rounded-xl p-6">
                            <h3 className="text-white font-semibold mb-4">AI Enrichment Options</h3>
                            <div className="grid gap-3 md:grid-cols-2">
                                {[
                                    { key: 'generateDescriptions', label: 'Generate Unique Descriptions' },
                                    { key: 'generateSeo', label: 'Generate SEO Meta Tags' },
                                    { key: 'generateFaq', label: 'Generate FAQ Content' },
                                    { key: 'translateToSpanish', label: 'Translate to Spanish' },
                                ].map(opt => (
                                    <label key={opt.key} className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={enrichmentOptions[opt.key as keyof EnrichmentOptions]}
                                            onChange={(e) => setEnrichmentOptions(prev => ({
                                                ...prev,
                                                [opt.key]: e.target.checked
                                            }))}
                                            className="w-5 h-5 rounded border-[#26342b] bg-mf-dark text-mf-green focus:ring-mf-green"
                                        />
                                        <span className="text-gray-300">{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                            <button
                                onClick={runEnrichmentLoop}
                                className="mt-6 px-6 py-3 bg-mf-green text-mf-dark font-semibold rounded-lg hover:bg-mf-green-hover flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined">auto_awesome</span>
                                Start AI Enrichment
                            </button>
                        </div>
                    )}

                    {/* Progress Card */}
                    <div className="bg-mf-card rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white font-semibold">Enrichment Progress</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${queueStatus.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                queueStatus.status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                                    queueStatus.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400' :
                                        queueStatus.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                                            'bg-gray-500/20 text-gray-400'
                                }`}>
                                {queueStatus.status.toUpperCase()}
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-400">
                                    {queueStatus.processedRows} / {queueStatus.totalRows} rows
                                </span>
                                <span className="text-gray-400">
                                    {Math.round((queueStatus.processedRows / queueStatus.totalRows) * 100)}%
                                </span>
                            </div>
                            <div className="bg-[#26342b] rounded-full h-3">
                                <div
                                    className="bg-mf-green h-3 rounded-full transition-all duration-500"
                                    style={{ width: `${(queueStatus.processedRows / queueStatus.totalRows) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="text-center p-3 bg-[#26342b] rounded-lg">
                                <div className="text-2xl font-bold text-green-400">{queueStatus.successfulRows}</div>
                                <div className="text-xs text-gray-400">Successful</div>
                            </div>
                            <div className="text-center p-3 bg-[#26342b] rounded-lg">
                                <div className="text-2xl font-bold text-red-400">{queueStatus.failedRows}</div>
                                <div className="text-xs text-gray-400">Failed</div>
                            </div>
                            <div className="text-center p-3 bg-[#26342b] rounded-lg">
                                <div className="text-2xl font-bold text-blue-400">
                                    {formatTimeRemaining(queueStatus.estimatedTimeRemaining)}
                                </div>
                                <div className="text-xs text-gray-400">Remaining</div>
                            </div>
                        </div>

                        {/* Control Buttons */}
                        <div className="flex gap-3">
                            {isEnriching && (
                                <button
                                    onClick={pauseEnrichment}
                                    className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm">pause</span>
                                    Pause
                                </button>
                            )}
                            {isPaused && (
                                <button
                                    onClick={resumeEnrichment}
                                    className="px-4 py-2 bg-mf-green text-mf-dark rounded-lg hover:bg-mf-green-hover flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm">play_arrow</span>
                                    Resume
                                </button>
                            )}
                            {queueStatus.failedRows > 0 && !isEnriching && (
                                <button
                                    onClick={retryFailed}
                                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm">refresh</span>
                                    Retry Failed ({queueStatus.failedRows})
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Processing Log */}
                    <div className="bg-mf-card rounded-xl p-6">
                        <h3 className="text-white font-semibold mb-4">Processing Log</h3>
                        <div className="max-h-64 overflow-y-auto space-y-2">
                            {processingLogs.length === 0 ? (
                                <p className="text-gray-500 text-sm">No logs yet. Start enrichment to see progress.</p>
                            ) : (
                                processingLogs.slice().reverse().map((log, i) => (
                                    <div key={i} className={`flex items-center gap-3 text-sm py-2 px-3 rounded ${log.success ? 'bg-green-500/10' : 'bg-red-500/10'
                                        }`}>
                                        <span className={`material-symbols-outlined text-base ${log.success ? 'text-green-400' : 'text-red-400'
                                            }`}>
                                            {log.success ? 'check_circle' : 'error'}
                                        </span>
                                        <span className="text-gray-300 flex-1 truncate">{log.workshopName}</span>
                                        {log.error && (
                                            <span className="text-red-400 text-xs truncate max-w-[200px]">{log.error}</span>
                                        )}
                                        <span className="text-gray-500 text-xs">
                                            {log.timestamp.toLocaleTimeString()}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Completion Message */}
                    {queueStatus.status === 'completed' && (
                        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center">
                            <span className="material-symbols-outlined text-green-400 text-5xl mb-2">celebration</span>
                            <h3 className="text-white font-semibold text-xl mb-2">Enrichment Complete!</h3>
                            <p className="text-gray-400">
                                Successfully enriched {queueStatus.successfulRows} workshops.
                                {queueStatus.failedRows > 0 && ` ${queueStatus.failedRows} failed.`}
                            </p>
                            <button
                                onClick={() => window.location.href = '/admin/workshops'}
                                className="mt-4 px-6 py-2 bg-mf-green text-mf-dark font-semibold rounded-lg hover:bg-mf-green-hover"
                            >
                                View Workshops
                            </button>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
