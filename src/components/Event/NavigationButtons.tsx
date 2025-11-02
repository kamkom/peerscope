"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

interface NavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  onNextStep: () => void;
  onPrevStep: () => void;
  isNextDisabled?: boolean;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  currentStep,
  totalSteps,
  onNextStep,
  onPrevStep,
  isNextDisabled = false,
}) => {
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="flex justify-between pt-4">
      {currentStep > 1 ? (
        <Button type="button" variant="outline" onClick={onPrevStep}>
          Back
        </Button>
      ) : (
        <div /> // Placeholder to keep the "Next" button on the right
      )}

      {isLastStep ? (
        <Button type="submit" disabled={isNextDisabled}>
          Save Event
        </Button>
      ) : (
        <Button type="button" onClick={onNextStep} disabled={isNextDisabled}>
          Next
        </Button>
      )}
    </div>
  );
};
