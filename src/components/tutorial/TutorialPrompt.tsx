import { BookOpen } from 'lucide-react';

interface TutorialPromptProps {
  isOpen: boolean;
  onStart: () => void;
  onSkip: () => void;
}

export const TutorialPrompt = ({ isOpen, onStart, onSkip }: TutorialPromptProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999]">
      <div className="bg-white border-2 border-black rounded-lg w-full max-w-md p-8 m-4 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-black rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-black">Welcome to SystemA!</h2>
              <p className="text-sm text-gray-600">System Architecture Design Tool</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-gray-800 mb-4 leading-relaxed">
            Would you like a quick guided tour? We'll show you how to:
          </p>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-black font-bold">•</span>
              <span>Create and connect components</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-black font-bold">•</span>
              <span>Document failure modes and recovery strategies</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-black font-bold">•</span>
              <span>Simulate failures to test resilience</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-black font-bold">•</span>
              <span>Save, collaborate, and export your architectures</span>
            </li>
          </ul>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onSkip}
            className="flex-1 px-4 py-3 border-2 border-black text-black rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Skip for now
          </button>
          <button
            onClick={onStart}
            className="flex-1 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Start Tutorial
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          You can restart the tutorial anytime from your profile menu
        </p>
      </div>
    </div>
  );
};
