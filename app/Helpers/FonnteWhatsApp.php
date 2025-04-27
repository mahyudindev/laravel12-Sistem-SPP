<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Http;

class FonnteWhatsApp
{
    /**
     * Send WhatsApp message via Fonnte
     *
     * @param string $to Phone number (with country code, e.g., 6281234567890)
     * @param string $message
     * @return array [success => bool, response => mixed]
     */
    public static function send($to, $message)
    {
        $apiKey = config('services.fonnte.token');
        $url = 'https://api.fonnte.com/send';

        $response = Http::withHeaders([
            'Authorization' => $apiKey,
        ])->asForm()->post($url, [
            'target' => $to,
            'message' => $message,
        ]);

        return [
            'success' => $response->successful(),
            'response' => $response->json()
        ];
    }
}
