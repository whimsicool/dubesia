<?php

namespace App\Support;

class GradeReportPdf
{
    private const PAGE_WIDTH = 595;
    private const PAGE_HEIGHT = 842;
    private const LEFT_MARGIN = 48;
    private const BOTTOM_MARGIN = 48;

    /**
     * @param array<int, array{name: string, weight: string|float, max_score: string|float, score: string|float|null, required: bool, feedback: string|null}> $components
     */
    public function render(
        string $studentName,
        string $studentEmail,
        string $className,
        string|float|null $finalScore,
        ?string $letterGrade,
        array $components,
    ): string {
        $lines = [
            ['GRADE REPORT', 'bold', 22, 12],
            ['Class: '.$className, 'bold', 14, 7],
            ['Student: '.$studentName, 'regular', 11, 4],
            ['Email: '.$studentEmail, 'regular', 10, 14],
            ['Final score: '.($finalScore ?? 'Not available').' / 100', 'bold', 13, 5],
            ['Letter grade: '.($letterGrade ?? 'Not available'), 'bold', 12, 12],
            ['ASSESSMENT BREAKDOWN', 'bold', 12, 8],
            ['Scores and feedback recorded by your tutor.', 'regular', 9, 10],
        ];

        if ($components === []) {
            $lines[] = ['There are no assessments for this class yet.', 'regular', 10, 8];
        }

        foreach ($components as $component) {
            $lines[] = [$component['name'], 'bold', 11, 4];
            $score = $component['score'] === null ? 'Not graded' : $component['score'].' / '.$component['max_score'];
            $requirement = $component['required'] ? 'Required' : 'Optional';
            $lines[] = ['Score: '.$score.'     Weight: '.$component['weight'].'%     '.$requirement, 'regular', 9, 4];

            if ($component['feedback']) {
                $lines[] = ['Feedback:', 'bold', 9, 2];
                foreach ($this->wrap($component['feedback'], 88) as $feedbackLine) {
                    $lines[] = [$feedbackLine, 'regular', 9, 2];
                }
            }

            $lines[] = ['', 'regular', 5, 8];
        }

        $pages = $this->paginate($lines, $studentName, $className);

        return $this->buildPdf($pages);
    }

    /**
     * @param array<int, array{0: string, 1: string, 2: int, 3: int}> $lines
     * @return array<int, array<int, array{0: string, 1: string, 2: int, 3: int}>>
     */
    private function paginate(array $lines, string $studentName, string $className): array
    {
        $pages = [[]];
        $pageIndex = 0;
        $y = self::PAGE_HEIGHT - 54;

        foreach ($lines as $line) {
            $lineHeight = $line[2] + $line[3] + 3;
            if ($y - $lineHeight < self::BOTTOM_MARGIN) {
                $pages[++$pageIndex] = [
                    ['GRADE REPORT (CONTINUED)', 'bold', 11, 5],
                    [$className.' — '.$studentName, 'regular', 9, 14],
                ];
                $y = self::PAGE_HEIGHT - 54 - (11 + 5 + 3) - (9 + 14 + 3);
            }

            $pages[$pageIndex][] = $line;
            $y -= $lineHeight;
        }

        return $pages;
    }

    /**
     * @param array<int, array<int, array{0: string, 1: string, 2: int, 3: int}>> $pages
     */
    private function buildPdf(array $pages): string
    {
        $pageCount = count($pages);
        $fontRegularId = 3 + ($pageCount * 2);
        $fontBoldId = $fontRegularId + 1;
        $objects = [
            1 => '<< /Type /Catalog /Pages 2 0 R >>',
            2 => '<< /Type /Pages /Kids ['.implode(' ', array_map(
                fn (int $index) => (3 + ($index * 2)).' 0 R',
                array_keys($pages),
            )).'] /Count '.$pageCount.' >>',
        ];

        foreach ($pages as $index => $lines) {
            $pageId = 3 + ($index * 2);
            $contentId = $pageId + 1;
            $content = $this->pageContent($lines);
            $objects[$pageId] = '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 '.self::PAGE_WIDTH.' '.self::PAGE_HEIGHT.'] /Resources << /Font << /F1 '.$fontRegularId.' 0 R /F2 '.$fontBoldId.' 0 R >> >> /Contents '.$contentId.' 0 R >>';
            $objects[$contentId] = '<< /Length '.strlen($content)." >>\nstream\n".$content."\nendstream";
        }

        $objects[$fontRegularId] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';
        $objects[$fontBoldId] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>';
        ksort($objects);

        $pdf = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
        $offsets = [0];
        foreach ($objects as $id => $object) {
            $offsets[$id] = strlen($pdf);
            $pdf .= $id." 0 obj\n".$object."\nendobj\n";
        }

        $xrefOffset = strlen($pdf);
        $pdf .= "xref\n0 ".(count($objects) + 1)."\n0000000000 65535 f \n";
        for ($id = 1; $id <= count($objects); $id++) {
            $pdf .= sprintf("%010d 00000 n \n", $offsets[$id]);
        }
        $pdf .= 'trailer << /Size '.(count($objects) + 1).' /Root 1 0 R >>' . "\nstartxref\n".$xrefOffset."\n%%EOF";

        return $pdf;
    }

    /**
     * @param array<int, array{0: string, 1: string, 2: int, 3: int}> $lines
     */
    private function pageContent(array $lines): string
    {
        $content = "0.12 0.16 0.24 rg\n";
        $y = self::PAGE_HEIGHT - 54;

        foreach ($lines as [$text, $font, $size, $gap]) {
            $y -= $size;
            if ($text !== '') {
                $fontName = $font === 'bold' ? 'F2' : 'F1';
                $content .= 'BT /'.$fontName.' '.$size.' Tf '.self::LEFT_MARGIN.' '.$y.' Td ('.$this->escapeText($text).") Tj ET\n";
            }
            $y -= $gap + 3;
        }

        return $content;
    }

    private function escapeText(string $text): string
    {
        $text = iconv('UTF-8', 'Windows-1252//TRANSLIT//IGNORE', $text) ?: '';
        $text = preg_replace('/[\x00-\x1F\x7F]/', ' ', $text) ?? '';

        return str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $text);
    }

    /** @return array<int, string> */
    private function wrap(string $text, int $width): array
    {
        $converted = iconv('UTF-8', 'Windows-1252//TRANSLIT//IGNORE', $text) ?: $text;
        $wrapped = wordwrap($converted, $width, "\n", true);

        return explode("\n", $wrapped);
    }
}
