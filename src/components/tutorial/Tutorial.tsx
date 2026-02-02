import { useState, useEffect, useRef } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { tutorialSteps } from './TutorialSteps';
import { useArchitectureStore } from '../../store/architectureStore';

interface TutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Tutorial = ({ isOpen, onClose }: TutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const { toggleMetadataPanel, isMetadataPanelOpen } = useArchitectureStore();

  const step = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;
  const isFirstStep = currentStep === 0;

  useEffect(() => {
    if (!isOpen) return;

    const updateHighlight = () => {
      const element = document.querySelector(step.targetSelector);
      if (element && element !== document.body) {
        const rect = element.getBoundingClientRect();
        setHighlightRect(rect);
      } else {
        setHighlightRect(null);
      }
    };

    updateHighlight();
    window.addEventListener('resize', updateHighlight);
    window.addEventListener('scroll', updateHighlight);

    // Re-check highlight after delays (for dynamic content like React Flow)
    const timers = [
      setTimeout(updateHighlight, 100),
      setTimeout(updateHighlight, 300),
      setTimeout(updateHighlight, 600),
    ];

    // Auto-click component for metadata step with retries
    if (step.id === 'component-metadata') {
      const tryOpenMetadata = (attempts: number = 0) => {
        if (attempts > 5) return; // Stop after 5 attempts
        
        setTimeout(() => {
          // Check if panel is already open
          if (isMetadataPanelOpen) return;
          
          const node = document.querySelector('.react-flow__node');
          if (node) {
            (node as HTMLElement).click();
            // Verify it opened, retry if not
            setTimeout(() => {
              if (!isMetadataPanelOpen) {
                tryOpenMetadata(attempts + 1);
              }
            }, 200);
          } else {
            // Node not found, retry
            tryOpenMetadata(attempts + 1);
          }
        }, 300 * (attempts + 1)); // Progressive delay: 300ms, 600ms, 900ms...
      };
      
      tryOpenMetadata();
    }

    // Ensure metadata panel is open for failure-modes and recovery-strategies steps
    if ((step.id === 'failure-modes' || step.id === 'recovery-strategies') && !isMetadataPanelOpen) {
      const node = document.querySelector('.react-flow__node');
      if (node) {
        // Double-click to open metadata panel
        const doubleClickEvent = new MouseEvent('dblclick', {
          view: window,
          bubbles: true,
          cancelable: true
        });
        node.dispatchEvent(doubleClickEvent);
      }
    }

    // Auto-close metadata panel before simulation step
    if (step.id === 'simulation' && isMetadataPanelOpen) {
      toggleMetadataPanel();
    }

    return () => {
      window.removeEventListener('resize', updateHighlight);
      window.removeEventListener('scroll', updateHighlight);
      timers.forEach(clearTimeout);
    };
  }, [isOpen, step.targetSelector, step.id]);

  const handleNext = () => {
    if (isLastStep) {
      onClose();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen) return null;

  const getTooltipPosition = (): React.CSSProperties => {
    // Always center the tooltip for now to ensure visibility
    return {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    };
  };

  const getArrowStyle = () => {
    if (!highlightRect || step.targetSelector === 'body') return { display: 'none' };

    const arrowSize = 12;
    let style: React.CSSProperties = {
      position: 'absolute',
      width: 0,
      height: 0,
      borderStyle: 'solid',
    };

    switch (step.position) {
      case 'top':
        style = {
          ...style,
          bottom: '-12px',
          left: '50%',
          transform: 'translateX(-50%)',
          borderWidth: `${arrowSize}px ${arrowSize}px 0 ${arrowSize}px`,
          borderColor: '#fff transparent transparent transparent',
        };
        break;
      case 'bottom':
        style = {
          ...style,
          top: '-12px',
          left: '50%',
          transform: 'translateX(-50%)',
          borderWidth: `0 ${arrowSize}px ${arrowSize}px ${arrowSize}px`,
          borderColor: 'transparent transparent #fff transparent',
        };
        break;
      case 'left':
        style = {
          ...style,
          right: '-12px',
          top: '50%',
          transform: 'translateY(-50%)',
          borderWidth: `${arrowSize}px 0 ${arrowSize}px ${arrowSize}px`,
          borderColor: 'transparent transparent transparent #fff',
        };
        break;
      case 'right':
        style = {
          ...style,
          left: '-12px',
          top: '50%',
          transform: 'translateY(-50%)',
          borderWidth: `${arrowSize}px ${arrowSize}px ${arrowSize}px 0`,
          borderColor: 'transparent #fff transparent transparent',
        };
        break;
    }

    return style;
  };

  return (
    <>
      {/* Dark overlay with cutout */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[9999]"
        style={{ pointerEvents: 'none' }}
      >
        <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
          <defs>
            <mask id="tutorial-mask">
              <rect width="100%" height="100%" fill="white" />
              {highlightRect && (
                <rect
                  x={highlightRect.left - 8}
                  y={highlightRect.top - 8}
                  width={highlightRect.width + 16}
                  height={highlightRect.height + 16}
                  rx="8"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.85)"
            mask="url(#tutorial-mask)"
          />
        </svg>

        {/* Highlight border */}
        {highlightRect && (
          <div
            style={{
              position: 'absolute',
              left: `${highlightRect.left - 8}px`,
              top: `${highlightRect.top - 8}px`,
              width: `${highlightRect.width + 16}px`,
              height: `${highlightRect.height + 16}px`,
              border: '2px solid white',
              borderRadius: '8px',
              pointerEvents: 'none',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />
        )}

        {/* Tooltip */}
        <div
          style={{
            ...getTooltipPosition(),
            position: 'fixed',
            pointerEvents: 'auto',
            width: '400px',
            maxHeight: '80vh',
            overflowY: 'auto',
            zIndex: 10000,
            minHeight: '200px',
            backgroundColor: 'white',
            border: '2px solid black',
            borderRadius: '8px',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }}
        >
          {/* Arrow */}
          <div style={getArrowStyle()} />

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'black', marginBottom: '4px' }}>
                {step.title}
              </h3>
              <p style={{ fontSize: '12px', color: '#6b7280' }}>
                Step {currentStep + 1} of {tutorialSteps.length}
              </p>
            </div>
            <button
              onClick={handleSkip}
              style={{ 
                padding: '4px',
                marginLeft: '8px',
                borderRadius: '4px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
              }}
              title="Skip tutorial"
            >
              <X style={{ width: '20px', height: '20px', color: 'black' }} />
            </button>
          </div>

          {/* Description */}
          <p style={{ fontSize: '14px', color: '#1f2937', marginBottom: '24px', lineHeight: '1.6' }}>
            {step.description}
          </p>

          {/* Progress bar */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ height: '4px', backgroundColor: '#e5e7eb', borderRadius: '9999px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  backgroundColor: 'black',
                  transition: 'all 0.3s',
                  width: `${((currentStep + 1) / tutorialSteps.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <button
              onClick={handlePrevious}
              disabled={isFirstStep}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 12px',
                fontSize: '14px',
                border: '1px solid black',
                borderRadius: '4px',
                backgroundColor: 'white',
                color: 'black',
                cursor: isFirstStep ? 'not-allowed' : 'pointer',
                opacity: isFirstStep ? 0.3 : 1,
              }}
            >
              <ChevronLeft style={{ width: '16px', height: '16px' }} />
              Previous
            </button>

            <button
              onClick={handleSkip}
              style={{
                padding: '8px 12px',
                fontSize: '14px',
                border: 'none',
                background: 'transparent',
                color: '#6b7280',
                cursor: 'pointer',
              }}
            >
              Skip Tutorial
            </button>

            <button
              onClick={handleNext}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 12px',
                fontSize: '14px',
                borderRadius: '4px',
                backgroundColor: 'black',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {isLastStep ? 'Finish' : 'Next'}
              {!isLastStep && <ChevronRight style={{ width: '16px', height: '16px' }} />}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }
      `}</style>
    </>
  );
};
