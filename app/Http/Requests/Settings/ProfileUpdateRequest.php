<?php

namespace App\Http\Requests\Settings;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nama' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->user_id, 'user_id'),
            ],
            // Admin fields
            'no_telp' => ['nullable', 'string', 'max:12'],
            'alamat' => ['nullable', 'string', 'max:100'],
            
            // Siswa fields
            'nis' => ['nullable', 'string', 'max:10'],
            'kelas' => ['nullable', 'string', 'max:5'],
            'jenis_kelamin' => ['nullable', 'in:L,P'],
            'tanggal_lahir' => ['nullable', 'date'],
            'no_hp' => ['nullable', 'string', 'max:13'],
            'tanggal_masuk' => ['nullable', 'date'],
        ];
    }
}
