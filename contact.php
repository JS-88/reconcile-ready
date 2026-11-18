<?php
declare(strict_types=1);

const CONTACT_RECIPIENT = 'hello@reconcileready.app';

function wantsJson(): bool
{
    return isset($_SERVER['HTTP_ACCEPT'])
        && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false;
}

function respond(int $status, string $message, bool $success = false): void
{
    http_response_code($status);

    if (wantsJson()) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(
            ['success' => $success, 'message' => $message],
            JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
        );
        exit;
    }

    $state = $success ? 'sent' : 'error';
    header('Location: contact.html?contact=' . $state . '#enquiry-form', true, 303);
    exit;
}

function cleanLine(string $value, int $maxLength): string
{
    $value = strip_tags(str_replace("\0", '', $value));
    $value = preg_replace('/\s+/', ' ', trim($value)) ?? '';
    return substr($value, 0, $maxLength);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, 'Please submit the enquiry form.');
}

if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 20000) {
    respond(413, 'Your enquiry is too long. Please shorten it and try again.');
}

// A completed honeypot is treated as a successful submission without sending mail.
if (trim((string) ($_POST['website'] ?? '')) !== '') {
    respond(200, 'Thank you — your enquiry has been sent.', true);
}

$name = cleanLine((string) ($_POST['name'] ?? ''), 100);
$email = trim((string) ($_POST['email'] ?? ''));
$company = cleanLine((string) ($_POST['company'] ?? ''), 150);
$interest = cleanLine((string) ($_POST['interest'] ?? ''), 100);
$message = trim(strip_tags(str_replace(["\r\n", "\r", "\0"], ["\n", "\n", ''], (string) ($_POST['message'] ?? ''))));
$message = substr($message, 0, 2500);

$allowedInterests = [
    'Reconciliation and profitability',
    'Channel reconciliation into Xero',
    'Product profitability and costs',
    'Using Reconcile Ready with accounting clients',
];

$validEmail = !preg_match('/[\r\n]/', $email)
    && strlen($email) <= 200
    && filter_var($email, FILTER_VALIDATE_EMAIL);

if ($name === '' || !$validEmail || !in_array($interest, $allowedInterests, true) || $message === '') {
    respond(422, 'Please complete all required fields with valid information.');
}

$body = implode("\n", [
    'New Reconcile Ready early-access enquiry',
    '',
    'Name: ' . $name,
    'Email: ' . $email,
    'Business: ' . ($company !== '' ? $company : 'Not provided'),
    'Interest: ' . $interest,
    '',
    'Message:',
    $message,
]);

$headers = implode("\r\n", [
    'From: Reconcile Ready Website <hello@reconcileready.app>',
    'Reply-To: ' . $email,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: Reconcile Ready Website',
]);

$sent = mail(CONTACT_RECIPIENT, 'New early-access enquiry', $body, $headers);

if (!$sent) {
    respond(500, 'We couldn’t send your enquiry. Please try again in a moment.');
}

respond(200, 'Thank you — your enquiry has been sent. We’ll reply by email.', true);
