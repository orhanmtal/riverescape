package com.gemini.riverescape;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.RequestConfiguration;

/**
 * River Escape Elite - MainActivity
 * v1.99.63.55 - Audience: 13+ (Teen)
 *
 * Families Policy does NOT apply for 13+ audience.
 * Full ad targeting enabled for maximum revenue.
 */
public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // --- AUDIENCE 13+: FULL AD TARGETING CONFIGURATION ---
        // Child-directed treatment is DISABLED for 13+ audience.
        // Max content rating set to T (Teen) — appropriate for this game.
        RequestConfiguration requestConfiguration = new RequestConfiguration.Builder()
            .setTagForChildDirectedTreatment(RequestConfiguration.TAG_FOR_CHILD_DIRECTED_TREATMENT_FALSE)
            .setMaxAdContentRating(RequestConfiguration.MAX_AD_CONTENT_RATING_T)
            .build();

        MobileAds.setRequestConfiguration(requestConfiguration);
    }
}
