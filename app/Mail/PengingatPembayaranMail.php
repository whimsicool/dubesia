<?php

namespace App\Mail;

use App\Models\Pendaftaran;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class PengingatPembayaranMail extends Mailable
{
    public function __construct(
        public Pendaftaran $pendaftaran,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address(config('mail.from.address'), 'Dubes Communications'),
            subject: 'Lanjutkan Pembayaran Pendaftaran Anda',
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.pengingat-pembayaran', with: [
            'programLabel' => Pendaftaran::labelProgram($this->pendaftaran->program),
        ]);
    }
}
