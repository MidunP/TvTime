// PM2 Ecosystem Config — Phase 6 Scaling
// Usage: pm2 start ecosystem.config.js --env production
module.exports = {
    apps: [
        {
            name: 'cinetrack-api',
            script: 'server.js',
            cwd: __dirname,

            // Cluster mode: leverages all CPU cores
            instances: 'max',
            exec_mode: 'cluster',

            // Auto-restart on uncaught exceptions
            autorestart: true,
            max_restarts: 10,
            min_uptime: '5s',

            // Memory threshold — restart if process exceeds 512MB
            max_memory_restart: '512M',

            // Graceful reload for zero-downtime deploys
            wait_ready: true,
            listen_timeout: 10000,
            kill_timeout: 10000,

            env: {
                NODE_ENV: 'development',
            },
            env_production: {
                NODE_ENV: 'production',
                LOG_LEVEL: 'info',
            },

            // Log files
            out_file: './logs/out.log',
            error_file: './logs/error.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
        },
    ],
};
