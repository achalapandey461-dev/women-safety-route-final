import React from 'react';
import { AlertTriangle, Phone, X, CheckCircle } from 'lucide-react';
import { useSafety } from '../contexts/SafetyContext';

interface SOSButtonProps {
  isNightMode: boolean;
}

export function SOSButton({ isNightMode }: SOSButtonProps) {
  const { emergencyContacts } = useSafety();
  const [isActive, setIsActive] = React.useState(false);
  const [isConfirmed, setIsConfirmed] = React.useState(false);

  const handleSOSClick = () => {
    setIsActive(true);
  };

  const handleConfirm = () => {
    setIsConfirmed(true);
    setTimeout(() => {
      setIsActive(false);
      setIsConfirmed(false);
    }, 3000);
  };

  const handleCancel = () => {
    setIsActive(false);
    setIsConfirmed(false);
  };

  if (isConfirmed) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div className={`p-4 rounded-2xl shadow-2xl border-2 border-green-500 max-w-xs ${
          isNightMode ? 'bg-green-900/90' : 'bg-green-50'
        }`}>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-10 h-10 text-green-500 animate-pulse" />
            <div>
              <p className={`font-bold text-lg ${isNightMode ? 'text-green-300' : 'text-green-700'}`}>
                SOS Sent!
              </p>
              <p className={`text-sm ${isNightMode ? 'text-green-400' : 'text-green-600'}`}>
                Emergency contacts notified
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isActive ? (
        <button
          onClick={handleSOSClick}
          className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center justify-center group"
          title="Emergency SOS"
        >
          <AlertTriangle className="w-8 h-8 group-hover:animate-bounce" />
        </button>
      ) : (
        <div className={`w-80 rounded-2xl shadow-2xl overflow-hidden ${
          isNightMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          {/* Header */}
          <div className="bg-red-500 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-white animate-pulse" />
              <div>
                <p className="text-white font-bold text-lg">Emergency SOS</p>
                <p className="text-red-200 text-sm">
                  {emergencyContacts.length > 0
                    ? `${emergencyContacts.length} contact(s) will be notified`
                    : 'No contacts added yet'}
                </p>
              </div>
            </div>
            <button onClick={handleCancel} className="p-1">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Body */}
          <div className={`p-4 ${isNightMode ? 'text-white' : 'text-gray-700'}`}>
            <p className="text-sm mb-4">
              This will immediately alert all your emergency contacts with your current location.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleConfirm}
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-colors flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-5 h-5" />
                Confirm SOS
              </button>
              <button
                onClick={handleCancel}
                className={`px-4 py-3 rounded-xl font-semibold transition-colors ${
                  isNightMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                Cancel
              </button>
            </div>

            {emergencyContacts.length > 0 && (
              <div className={`mt-4 pt-4 border-t ${isNightMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <p className={`text-xs font-semibold mb-2 ${isNightMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  EMERGENCY CONTACTS:
                </p>
                {emergencyContacts.map((contact) => (
                  <div key={contact.id} className="flex items-center gap-2 text-sm mt-1">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{contact.name}</span>
                    <span className="text-xs text-gray-500">({contact.phone})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SOSButton;
