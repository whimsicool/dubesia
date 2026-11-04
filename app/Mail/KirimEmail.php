<?php

namespace App\Mail;

use App\Models\Pendaftaran;
use App\Support\PaymentReceiptPdf;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class KirimEmail extends Mailable
{
    public function __construct(
        public Pendaftaran $pendaftaran,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address(config('mail.from.address'), 'Dubes Communications'),
            subject: 'Pendaftaran Kursus Dubes Communications Berhasil',
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.pendaftaran-disetujui');
    }

    public function attachments(): array
    {
        $registrationId = str_pad((string) $this->pendaftaran->id, 6, '0', STR_PAD_LEFT);

        return [
            Attachment::fromData(
                fn () => app(PaymentReceiptPdf::class)->generate($this->pendaftaran),
                "Kuitansi-Pembayaran-Dubes-{$registrationId}.pdf",
            )->withMime('application/pdf'),
        ];
    }
}
