<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class LogService
{
    /**
     * Log a user activity in the database.
     */
    public static function log($action, $description = null, $status = 'success')
    {
        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => $action,
            'description' => $description,
            'status' => $status,
            'ip' => Request::ip(),
            'user_agent' => Request::userAgent()
        ]);
    }

    /**
     * Delete logs older than X days.
     */
    public static function cleanup($days = 15)
    {
        ActivityLog::where('created_at', '<', now()->subDays($days))->delete();
    }
}
