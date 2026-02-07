// src/features/plans/CreatePlan.jsx
/**
 * Create Plan Component
 * Wrapper for the TravelWizard to create new trip plans.
 */
import React from 'react';
import TravelWizard from './TravelWizard';

function CreatePlan() {
    return (
        <div>
            <div>
                <h1>
                    Create New Trip Plan
                </h1>
            </div>

            <TravelWizard />
        </div>
    );
}

export default CreatePlan;
