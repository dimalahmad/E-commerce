'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Upload, X, FileImage, AlertCircle, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { apiClient } from '@/lib/api'

interface PaymentProofUploadProps {
  orderId: string
  onUpload: (proofUrl: string) => void
  currentProof?: string
}

export default function PaymentProofUpload({ orderId, onUpload, currentProof }: PaymentProofUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentProof || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): boolean => {
    // Izinkan PNG, JPG, JPEG
    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Hanya file gambar PNG, JPG, atau JPEG yang diperbolehkan')
      return false
    }
    // Maksimal 2MB
    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('Ukuran file maksimal 2MB')
      return false
    }
    return true
  }

  const handleFile = async (file: File) => {
    if (!validateFile(file)) return

    setIsUploading(true)
    try {
      // Simulate file upload (in real app, upload to server)
      await new Promise(resolve => setTimeout(resolve, 2000))
      // Create a preview URL
      const reader = new FileReader()
      reader.onload = async (e) => {
        const result = e.target?.result as string
        setPreview(result)
        // In real app, this would be the uploaded file URL
        const mockUploadedUrl = result
        // Update order di backend
        try {
          await apiClient.updateOrder(orderId, { paymentProof: mockUploadedUrl })
          onUpload(mockUploadedUrl)
          toast.success('Bukti pembayaran berhasil diupload!')
        } catch (err) {
          toast.error('Gagal menyimpan bukti pembayaran ke server')
        }
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Gagal mengupload bukti pembayaran')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const removeFile = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Upload Bukti Pembayaran</h3>
        <p className="text-gray-500 dark:text-white/60 text-sm mb-4">
          Upload bukti pembayaran dalam format PNG, JPG, atau JPEG (maksimal 2MB)
        </p>
      </div>

      {preview ? (
        <div className="space-y-4">
          <div className="relative">
            <img
              src={preview}
              alt="Payment proof preview"
              className="w-full max-w-md rounded-lg border border-white/10"
            />
            <button
              onClick={removeFile}
              className="absolute top-2 right-2 glass-button p-1 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 text-green-500 dark:text-green-400">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Bukti pembayaran berhasil diupload</span>
          </div>
        </div>
      ) : (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
            dragActive
              ? 'border-neon-blue bg-neon-blue/10'
              : 'border-white/20 hover:border-white/40'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />
          
          <div className="space-y-4">
            {isUploading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-blue"></div>
                <span className="ml-2 text-gray-900 dark:text-white">Mengupload...</span>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 bg-gradient-to-r from-neon-blue to-neon-purple rounded-full flex items-center justify-center mx-auto">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-gray-900 dark:text-white font-medium mb-2">
                    Drag & drop file gambar atau klik untuk memilih
                  </p>
                  <p className="text-gray-500 dark:text-white/60 text-sm">
                    PNG, JPG, JPEG (maksimal 2MB)
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-900 dark:text-white/80">
            <p className="font-medium text-blue-600 dark:text-blue-400 mb-1">Penting:</p>
            <ul className="space-y-1">
              <li>• Pastikan bukti pembayaran jelas dan terbaca</li>
              <li>• Pembayaran akan diverifikasi dalam 1-2 jam kerja</li>
              <li>• Status pesanan akan berubah otomatis setelah verifikasi</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 