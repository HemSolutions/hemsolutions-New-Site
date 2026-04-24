<?php
// 46elks SMS Integration
// https://46elks.com/docs/send-sms

class SMSService {
    private $username;
    private $password;
    private $fromNumber;
    private $apiUrl = 'https://api.46elks.com/a1/sms';
    
    public function __construct($username, $password, $fromNumber) {
        $this->username = $username;
        $this->password = $password;
        $this->fromNumber = $fromNumber;
    }
    
    /**
     * Send SMS via 46elks
     * 
     * @param string $to Recipient phone number (Swedish format: 07XXXXXXXX or +467XXXXXXXX)
     * @param string $message Message content (max 1600 characters)
     * @param array $options Optional: dryrun, whendelivered, callback_url, etc.
     * @return array Response with status and details
     */
    public function sendSMS($to, $message, $options = []) {
        // Normalize Swedish phone number
        $to = $this->normalizePhoneNumber($to);
        
        if (empty($to) || empty($message)) {
            return [
                'success' => false,
                'error' => 'Phone number and message are required'
            ];
        }
        
        if (strlen($message) > 1600) {
            $message = substr($message, 0, 1600);
        }
        
        $params = [
            'from' => $this->fromNumber,
            'to' => $to,
            'message' => $message,
        ];
        
        // Add optional parameters
        if (isset($options['dryrun'])) {
            $params['dryrun'] = $options['dryrun'] ? 'yes' : 'no';
        }
        if (isset($options['whendelivered'])) {
            $params['whendelivered'] = $options['whendelivered'];
        }
        if (isset($options['callback_url'])) {
            $params['callback_url'] = $options['callback_url'];
        }
        
        $ch = curl_init($this->apiUrl);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($params));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_USERPWD, $this->username . ':' . $this->password);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/x-www-form-urlencoded'
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        if ($error) {
            return [
                'success' => false,
                'error' => 'cURL error: ' . $error,
                'http_code' => $httpCode
            ];
        }
        
        $result = json_decode($response, true);
        
        if ($httpCode === 200 && isset($result['id'])) {
            return [
                'success' => true,
                'message_id' => $result['id'],
                'status' => $result['status'] ?? 'sent',
                'cost' => $result['cost'] ?? null,
                'parts' => $result['parts'] ?? 1,
                'details' => $result
            ];
        }
        
        return [
            'success' => false,
            'error' => $result['detail'] ?? $result['error'] ?? 'Unknown error',
            'http_code' => $httpCode,
            'details' => $result
        ];
    }
    
    /**
     * Send bulk SMS to multiple recipients
     */
    public function sendBulkSMS(array $recipients, $message) {
        $results = [];
        foreach ($recipients as $recipient) {
            $phone = is_array($recipient) ? ($recipient['phone'] ?? '') : $recipient;
            $customMessage = is_array($recipient) ? ($recipient['message'] ?? $message) : $message;
            
            $results[] = [
                'phone' => $phone,
                'result' => $this->sendSMS($phone, $customMessage)
            ];
        }
        return $results;
    }
    
    /**
     * Normalize Swedish phone number to +46 format
     */
    private function normalizePhoneNumber($phone) {
        $phone = preg_replace('/[^\d+]/', '', $phone);
        
        if (strpos($phone, '+46') === 0) {
            return $phone;
        }
        
        if (strpos($phone, '46') === 0) {
            return '+' . $phone;
        }
        
        if (strpos($phone, '07') === 0 || strpos($phone, '08') === 0) {
            return '+46' . substr($phone, 1);
        }
        
        return $phone;
    }
    
    /**
     * Get account balance from 46elks
     */
    public function getBalance() {
        $ch = curl_init('https://api.46elks.com/a1/me');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_USERPWD, $this->username . ':' . $this->password);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode === 200) {
            $result = json_decode($response, true);
            return [
                'success' => true,
                'balance' => $result['balance'] ?? 0,
                'currency' => $result['currency'] ?? 'SEK'
            ];
        }
        
        return [
            'success' => false,
            'error' => 'Failed to retrieve balance'
        ];
    }
}

/**
 * Factory function to create SMS service with credentials from environment or config
 */
function createSMSService($config = null) {
    if ($config === null) {
        // Try to load from environment or a config file
        $configFile = __DIR__ . '/../config/sms.php';
        if (file_exists($configFile)) {
            $config = require $configFile;
        }
    }
    
    $username = $config['username'] ?? $_ENV['SMS_46ELKS_USERNAME'] ?? null;
    $password = $config['password'] ?? $_ENV['SMS_46ELKS_PASSWORD'] ?? null;
    $fromNumber = $config['from_number'] ?? $_ENV['SMS_FROM_NUMBER'] ?? 'HemSolutions';
    
    if (!$username || !$password) {
        return null;
    }
    
    return new SMSService($username, $password, $fromNumber);
}
