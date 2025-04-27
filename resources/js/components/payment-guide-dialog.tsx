"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, CreditCard, Copy, Upload, ArrowRight, ArrowLeft } from "lucide-react"

export function PaymentGuideDialog() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1)

  const nextStep = () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      setOpen(false)
      setStep(1)
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  // Function to copy text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        // You could add a toast notification here
        console.log("Copied to clipboard")
      })
      .catch((err) => {
        console.error("Failed to copy: ", err)
      })
  }

  return (
    <>
      {/* Button to open the dialog */}
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 md:top-20 md:bottom-auto z-50 flex items-center gap-1 md:gap-2 px-2.5 py-1.5 md:px-3 md:py-2 text-xs md:text-sm bg-white dark:bg-gray-800 shadow-lg rounded-full md:rounded-lg"
      >
        <CreditCard className="h-3.5 w-3.5 md:h-4 md:w-4" />
        <span className="hidden xs:inline">Panduan Pembayaran</span>
        <span className="xs:hidden">Panduan</span>
      </Button>

      {/* Payment Guide Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-zinc-800 bg-[#0A0A0A] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <CreditCard className="h-5 w-5 text-primary-500" />
              Cara Pembayaran
            </DialogTitle>
            <DialogDescription>Ikuti langkah-langkah berikut untuk melakukan pembayaran</DialogDescription>
          </DialogHeader>

          {/* Step Indicator */}
          <div className="flex justify-between mb-4 px-2">
            <div className="flex flex-col items-center">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center ${step === 1 ? "bg-primary-500 text-white" : "bg-gray-800 text-gray-400"}`}
              >
                1
              </div>
              <span className="text-xs mt-1">Pilih Tagihan</span>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className={`h-1 w-full ${step > 1 ? "bg-primary-500" : "bg-gray-700"}`}></div>
            </div>
            <div className="flex flex-col items-center">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center ${step === 2 ? "bg-primary-500 text-white" : step > 2 ? "bg-primary-500 text-white" : "bg-gray-800 text-gray-400"}`}
              >
                2
              </div>
              <span className="text-xs mt-1">Transfer</span>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className={`h-1 w-full ${step > 2 ? "bg-primary-500" : "bg-gray-700"}`}></div>
            </div>
            <div className="flex flex-col items-center">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center ${step === 3 ? "bg-primary-500 text-white" : "bg-gray-800 text-gray-400"}`}
              >
                3
              </div>
              <span className="text-xs mt-1">Upload Bukti</span>
            </div>
          </div>

          {/* Step Content */}
          <div className="py-4">
            {/* Step 1: Select Payment Items */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="rounded-lg border border-gray-800 p-4 bg-gray-900/30">
                  <h3 className="font-medium mb-2 flex items-center text-white">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-white text-sm mr-2">
                      1
                    </span>
                    Pilih SPP atau Tagihan PPDB
                  </h3>
                  <div className="pl-8 space-y-2">
                    <p className="text-sm text-gray-400">
                      Pilih tagihan yang ingin Anda bayar dengan mencentang kotak di samping item tagihan.
                    </p>
                    <div className="bg-gray-900 rounded-md p-3 border border-gray-800 mt-2">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded border border-primary-500 bg-primary-900/20"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">SPP Bulan Januari</p>
                          <div className="flex justify-between">
                            <span className="text-xs text-primary-400">Rp500.000</span>
                            <span className="text-xs text-gray-400">2023/2024</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-800 p-4 bg-gray-900/30">
                  <h3 className="font-medium mb-2 flex items-center text-white">
                    <CheckCircle className="h-5 w-5 text-primary-500 mr-2" />
                    Total Tagihan Terpilih
                  </h3>
                  <p className="text-sm text-gray-400 pl-7">
                    Sistem akan menghitung total tagihan yang Anda pilih secara otomatis.
                  </p>
                  <div className="bg-gray-900 rounded-md p-3 border border-gray-800 mt-2 flex justify-between items-center">
                    <span className="text-sm text-gray-400">Total Tagihan:</span>
                    <span className="font-medium text-primary-500">Rp500.000</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Payment Information */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="rounded-lg border border-gray-800 p-4 bg-gray-900/30">
                  <h3 className="font-medium mb-2 flex items-center text-white">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-white text-sm mr-2">
                      2
                    </span>
                    Salin Nominal dan Nomor Rekening
                  </h3>
                  <div className="pl-8 space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-400">Salin jumlah yang harus dibayar:</p>
                      <div className="bg-gray-900 rounded-md p-3 border border-gray-800 flex justify-between items-center">
                        <span className="font-medium text-primary-500">Rp500.000</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1"
                          onClick={() => copyToClipboard("500000")}
                        >
                          <Copy className="h-3.5 w-3.5" />
                          <span className="text-xs">Salin</span>
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-gray-400">Salin nomor rekening tujuan:</p>
                      <div className="bg-gray-900 rounded-md p-3 border border-gray-800">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-xs text-gray-400">Bank BCA</p>
                            <p className="font-medium text-white">5402181206</p>
                            <p className="text-xs text-gray-400">a.n. TK PARADISE</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1"
                            onClick={() => copyToClipboard("5402181206")}
                          >
                            <Copy className="h-3.5 w-3.5" />
                            <span className="text-xs">Salin</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-primary-800/30 p-4 bg-primary-900/10">
                  <h3 className="font-medium mb-2 text-primary-500 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Lakukan Transfer
                  </h3>
                  <p className="text-sm pl-7 text-gray-300">
                    Transfer sesuai nominal yang tertera menggunakan mobile banking, internet banking, atau ATM.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Upload Proof */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="rounded-lg border border-gray-800 p-4 bg-gray-900/30">
                  <h3 className="font-medium mb-2 flex items-center text-white">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-white text-sm mr-2">
                      3
                    </span>
                    Upload Bukti Transfer
                  </h3>
                  <div className="pl-8 space-y-2">
                    <p className="text-sm text-gray-400">
                      Setelah melakukan transfer, unggah bukti pembayaran dengan mengklik area upload.
                    </p>
                    <div className="border border-dashed border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-900/50 mt-2">
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm font-medium text-white">Klik untuk mengunggah bukti</p>
                      <p className="text-xs text-gray-500 mt-1">Format: JPG, PNG (Max 2MB)</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-primary-800/30 p-4 bg-primary-900/10">
                  <h3 className="font-medium mb-2 text-primary-500 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Kirim Pembayaran
                  </h3>
                  <p className="text-sm pl-7 text-gray-300">
                    Setelah mengupload bukti transfer, klik tombol "Kirim Pembayaran" untuk menyelesaikan proses.
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-between sm:justify-between">
            {step > 1 && (
              <Button type="button" variant="outline" onClick={prevStep} className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                Kembali
              </Button>
            )}
            <Button type="button" onClick={nextStep} className="gap-1">
              {step === 3 ? "Selesai" : "Lanjut"}
              {step < 3 && <ArrowRight className="h-4 w-4" />}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
