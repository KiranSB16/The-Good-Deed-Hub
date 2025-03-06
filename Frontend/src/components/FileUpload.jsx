import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'react-toastify';
import axios from '../config/axios';
import { useSelector } from 'react-redux';

const FileUpload = ({ onUploadSuccess, acceptedTypes = "image/jpeg, image/png, application/pdf" }) => {
    const [files, setFiles] = useState([]); // Support multiple files
    const [uploading, setUploading] = useState(false);
    const user = useSelector(state => state.auth.user);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files); // Convert FileList to array
        const validFiles = [];

        selectedFiles.forEach(file => {
            if (!file.type.match(/(image\/jpeg|image\/png|application\/pdf)/)) {
                toast.error(`Invalid file type: ${file.name}`);
            } else if (file.size > 5 * 1024 * 1024) {
                toast.error(`File too large: ${file.name}`);
            } else {
                validFiles.push(file);
            }
        });

        if (validFiles.length > 0) {
            setFiles(prevFiles => [...prevFiles, ...validFiles]); // Add new valid files
        }
    };

    const handleUpload = async () => {
        if (!user || user.role !== 'fundraiser') {
            toast.error('Only fundraisers can upload files');
            return;
        }

        if (files.length === 0) {
            toast.error('Please select at least one file');
            return;
        }

        setUploading(true);
        const formData = new FormData();

        files.forEach(file => {
            formData.append('files', file); // Append multiple files
        });

        try {
            const response = await axios.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.data.urls) {
                toast.success('Files uploaded successfully');
                onUploadSuccess(response.data.urls);
                setFiles([]); // Clear file selection
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error.response?.data?.message || 'Error uploading files');
        } finally {
            setUploading(false);
        }
    };

    const removeFile = (index) => {
        setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    };

    if (user?.role !== 'fundraiser') {
        return null;
    }

    return (
        <div className="space-y-4">
            <Input
                type="file"
                accept={acceptedTypes}
                multiple // Allow multiple file selection
                onChange={handleFileChange}
                disabled={uploading}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            
            {files.length > 0 && (
                <ul className="space-y-2">
                    {files.map((file, index) => (
                        <li key={index} className="flex justify-between items-center p-2 border rounded">
                            <span>{file.name}</span>
                            <Button onClick={() => removeFile(index)} size="sm" variant="destructive">
                                Remove
                            </Button>
                        </li>
                    ))}
                </ul>
            )}

            {files.length > 0 && (
                <Button onClick={handleUpload} disabled={uploading} className="w-full">
                    {uploading ? 'Uploading...' : 'Upload Files'}
                </Button>
            )}
        </div>
    );
};

export default FileUpload;
