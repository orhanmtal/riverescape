const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'www', 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

const cssInjection = `
    <!-- ELITE DESKTOP HUD CENTERING (v1.99.66) -->
    <style>
        @media (min-width: 800px) {
            /* Move Top-Left HUD closer to the canvas */
            #hud-v2, .elite-hud-v2 {
                left: calc(50vw - 320px) !important; 
            }
            
            /* Move Bottom-Left Bomb Button closer to the canvas */
            #bomb-action-btn {
                left: calc(50vw - 320px) !important;
            }
            
            /* Move Bottom-Right Controls closer to the canvas */
            #controls-ui, #fire-action-btn, #dash-action-btn {
                right: calc(50vw - 320px) !important;
            }
        }
    </style>
`;

if (!indexContent.includes('ELITE DESKTOP HUD CENTERING')) {
    indexContent = indexContent.replace('</head>', cssInjection + '\n</head>');
    fs.writeFileSync(indexPath, indexContent, 'utf8');
    console.log('✅ [ELITE HUD CENTERING FIX] Applied successfully.');
} else {
    console.log('⚠️ [ELITE HUD CENTERING FIX] Already exists.');
}
