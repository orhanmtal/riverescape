const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'www', 'index.html');
let content = fs.readFileSync(indexPath, 'utf8');

// Remove corrupted bomb icons anywhere in the file (just the bad spans)
content = content.replace(/<span style="font-size: 24px; pointer-events: none;">Ÿ’▱Â<\/span>/g, '<span style="font-size: 24px; pointer-events: none; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));">💣</span>');

// Inject enhanced CSS for locking the HUD to the canvas
const enhancedCSS = `
    <!-- ELITE HUD LOCK (v1.99.68) -->
    <style>
        @media (min-width: 600px) {
            /* Force the top-left HUD to stick to the left side of the 500px game canvas */
            #hud-v2, .elite-hud-container {
                left: calc(50vw - 230px) !important;
            }
            
            /* Force the bottom-left Bomb Button to stick to the left side of the canvas */
            #bomb-action-btn {
                left: calc(50vw - 230px) !important;
            }
            
            /* Force the bottom-right controls to stick to the right side of the canvas */
            #controls-ui {
                right: calc(50vw - 230px) !important;
            }
        }
    </style>
`;

if (!content.includes('ELITE HUD LOCK')) {
    content = content.replace('</head>', enhancedCSS + '\n</head>');
}

fs.writeFileSync(indexPath, content, 'utf8');
console.log('✅ [ELITE HUD REBUILD] Completed successfully.');
