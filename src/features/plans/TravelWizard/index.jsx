// src/features/plans/TravelWizard/index.jsx
/**
 * TravelWizard コントローラー
 * 旅行プラン作成のためのマルチステップウィザードを管理します。
 */
import React, { useState } from 'react';
import Step1Activity from './Step1Activity';
import Step2Destination from './Step2Destination';
import Step3Details from './Step3Details';
import Step4Plan from './Step4Plan';
import storageService from '../../../services/storageService';

const STEPS = ['キーワード', '行き先', '詳細', '完了'];

function TravelWizard({ onComplete }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [wizardData, setWizardData] = useState({
        activity: '',
        destination: null,
        startDate: '',
        endDate: '',
        budget: '',
        preferences: '',
        generatedPlan: null
    });

    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const planId = params.get('id');
        const sharedData = params.get('plan');

        if (planId) {
            // ストレージから読み込む
            const savedPlans = storageService.getPlans();
            const foundPlan = savedPlans.find(p => p.id === planId);
            if (foundPlan) {
                setWizardData({
                    ...foundPlan.params,
                    generatedPlan: foundPlan
                });
                setCurrentStep(4);
            }
        } else if (sharedData) {
            // 共有リンクから復元
            try {
                const decoded = JSON.parse(decodeURIComponent(escape(atob(sharedData))));
                setWizardData({
                    ...decoded.params,
                    generatedPlan: decoded
                });
                setCurrentStep(4);
            } catch (err) {
                console.error('Failed to decode shared plan:', err);
            }
        }
    }, []);

    const updateData = (newData) => {
        setWizardData(prev => ({ ...prev, ...newData }));
    };

    const nextStep = () => {
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleComplete = (plan) => {
        if (onComplete) {
            onComplete(plan);
        }
    };

    return (
        <div translate="no">
            {/* プログレスバー */}
            {/* Progress Bar */}
            <div className="mb-4" style={{ padding: '0 1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>

                    {/* 背景ライン */}
                    <div style={{
                        position: 'absolute',
                        top: '15px',
                        left: '0',
                        right: '0',
                        height: '2px',
                        backgroundColor: '#e0e0e0',
                        zIndex: 0
                    }}></div>

                    {/* アクティブなプログレスライン（ステップに基づいて概算） */}
                    <div style={{
                        position: 'absolute',
                        top: '15px',
                        left: '0',
                        width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`,
                        height: '2px',
                        backgroundColor: 'var(--primary-color)',
                        zIndex: 0,
                        transition: 'width 0.3s ease'
                    }}></div>

                    {STEPS.map((step, index) => {
                        const stepNum = index + 1;
                        const isActive = currentStep === stepNum;
                        const isCompleted = currentStep > stepNum;

                        return (
                            <div key={index} style={{ position: 'relative', zIndex: 1, textAlign: 'center', width: '80px' }}>
                                <div style={{
                                    width: '30px',
                                    height: '30px',
                                    borderRadius: '50%',
                                    backgroundColor: isActive || isCompleted ? 'var(--primary-color)' : '#fff',
                                    border: `2px solid ${isActive || isCompleted ? 'var(--primary-color)' : '#e0e0e0'}`,
                                    color: isActive || isCompleted ? '#fff' : '#999',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    margin: '0 auto 5px',
                                    fontWeight: 'bold',
                                    fontSize: '0.9rem',
                                    transition: 'all 0.3s ease'
                                }}>
                                    <span>{isCompleted ? '✓' : stepNum}</span>
                                </div>
                                <div style={{
                                    fontSize: '0.8rem',
                                    color: isActive ? 'var(--primary-color)' : '#999',
                                    fontWeight: isActive ? 'bold' : 'normal'
                                }}>
                                    <span>{step}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ステップコンテンツ */}
            <div>
                {currentStep === 1 && (
                    <Step1Activity
                        data={wizardData}
                        onNext={(data) => {
                            updateData(data);
                            nextStep();
                        }}
                    />
                )}
                {currentStep === 2 && (
                    <Step2Destination
                        data={wizardData}
                        onNext={(data) => {
                            updateData(data);
                            nextStep();
                        }}
                        onBack={prevStep}
                    />
                )}
                {currentStep === 3 && (
                    <Step3Details
                        data={wizardData}
                        onNext={(data) => {
                            updateData(data);
                            nextStep();
                        }}
                        onBack={prevStep}
                    />
                )}
                {currentStep === 4 && (
                    <Step4Plan
                        data={wizardData}
                        onBack={prevStep}
                        onComplete={handleComplete}
                        updateData={updateData}
                    />
                )}
            </div>
        </div>
    );
}

export default TravelWizard;
