import React from "react";
import {
  Share2,
  Copy,
  Check,
  X,
  Users,
  Plus,
  Phone,
  User,
} from "lucide-react";

import { useSafety } from "../contexts/SafetyContext";
import type { Trip } from "../types";

interface TripSharingProps {
  trip: Trip | null;
  isNightMode: boolean;
}

export default function TripSharing({
  trip,
  isNightMode,
}: TripSharingProps) {
  const { emergencyContacts, addEmergencyContact } = useSafety();

  const [isOpen, setIsOpen] = React.useState(false);
  const [shareLink, setShareLink] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  const [showAddContact, setShowAddContact] = React.useState(false);

  const [newContact, setNewContact] = React.useState({
    name: "",
    phone: "",
    relationship: "",
  });

  const handleShare = () => {
    if (trip) {
      setShareLink(`https://safeher.app/trip/${trip.id}`);
    } else {
      setShareLink(`https://safeher.app/trip/demo-${Date.now()}`);
    }

    setIsOpen(true);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone) return;

    addEmergencyContact({
      name: newContact.name,
      phone: newContact.phone,
      relationship: newContact.relationship || "Other",
    });

    setNewContact({
      name: "",
      phone: "",
      relationship: "",
    });

    setShowAddContact(false);
  };

  return (
    <>
      <button
        onClick={handleShare}
        className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all duration-300 shadow-md hover:scale-105 ${
          isNightMode
            ? "bg-gray-700 hover:bg-gray-600 text-white"
            : "bg-white hover:bg-gray-100 text-gray-800 border"
        }`}
      >
        <Share2 className="w-5 h-5" />
        Share Trip
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center">


          {/* Blur Background */}

          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-md"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}

          <div
            className={`relative z-[100000]  w-full max-w-xl mx-4 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 ${
              isNightMode
                ? "bg-gray-900 text-white border border-gray-700"
                : "bg-white text-gray-900"
            }`}
          >
                      {/* Header */}

            <div
              className={`flex items-center justify-between px-6 py-5 border-b ${
                isNightMode
                  ? "border-gray-700 bg-gray-800"
                  : "border-gray-200 bg-gradient-to-r from-pink-50 to-purple-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>

                <div>
                  <h2 className="text-xl font-bold">
                    Live Trip Sharing
                  </h2>

                  <p
                    className={`text-sm ${
                      isNightMode
                        ? "text-gray-400"
                        : "text-gray-600"
                    }`}
                  >
                    Share your live location with trusted contacts
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className={`p-2 rounded-xl transition ${
                  isNightMode
                    ? "hover:bg-gray-700"
                    : "hover:bg-gray-200"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}

            <div className="p-6">

              {/* Share Link */}

              <div className="mb-6">

                <label
                  className={`block mb-2 font-semibold ${
                    isNightMode
                      ? "text-gray-300"
                      : "text-gray-700"
                  }`}
                >
                  Trip Link
                </label>

                <div className="flex gap-3">

                  <input
                    value={shareLink}
                    readOnly
                    className={`flex-1 px-4 py-3 rounded-xl border outline-none ${
                      isNightMode
                        ? "bg-gray-800 border-gray-700 text-white"
                        : "bg-gray-100 border-gray-300"
                    }`}
                  />

                  <button
                    onClick={handleCopy}
                    className={`px-5 rounded-xl font-semibold transition-all ${
                      copied
                        ? "bg-green-500 text-white"
                        : "bg-primary-500 hover:bg-primary-600 text-white"
                    }`}
                  >
                    {copied ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>

                </div>

              </div>

              {/* Emergency Contacts */}

              <div className="flex items-center justify-between mb-4">

                <h3 className="text-lg font-semibold">
                  Emergency Contacts
                </h3>

                <button
                  onClick={() => setShowAddContact(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white transition"
                >
                  <Plus className="w-4 h-4" />
                  Add Contact
                </button>

              </div>
                            {emergencyContacts.length === 0 ? (

                <div
                  className={`rounded-2xl border-2 border-dashed p-8 text-center ${
                    isNightMode
                      ? "border-gray-700 bg-gray-800"
                      : "border-gray-300 bg-gray-50"
                  }`}
                >
                  <Users className="w-10 h-10 mx-auto mb-3 text-gray-400" />

                  <h4 className="font-semibold mb-1">
                    No Emergency Contacts
                  </h4>

                  <p
                    className={`text-sm ${
                      isNightMode
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  >
                    Add trusted people who can monitor your trip.
                  </p>
                </div>

              ) : (

                <div className="space-y-3">

                  {emergencyContacts.map((contact) => (

                    <div
                      key={contact.id}
                      className={`flex items-center justify-between rounded-2xl p-4 transition hover:scale-[1.02] ${
                        isNightMode
                          ? "bg-gray-800 border border-gray-700"
                          : "bg-gray-50 border border-gray-200"
                      }`}
                    >

                      <div className="flex items-center gap-4">

                        <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold">
                          {contact.name.charAt(0).toUpperCase()}
                        </div>

                        <div>

                          <h4 className="font-semibold">
                            {contact.name}
                          </h4>

                          <p
                            className={`text-sm ${
                              isNightMode
                                ? "text-gray-400"
                                : "text-gray-500"
                            }`}
                          >
                            {contact.relationship}
                          </p>

                        </div>

                      </div>

                      <div className="flex items-center gap-2">

                        <Phone className="w-4 h-4 text-primary-500" />

                        <span className="text-sm font-medium">
                          {contact.phone}
                        </span>

                      </div>

                    </div>

                  ))}

                </div>

              )}

              {showAddContact && (

                <div
                  className={`mt-6 rounded-2xl p-5 border ${
                    isNightMode
                      ? "bg-gray-800 border-gray-700"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >

                  <h3 className="text-lg font-bold mb-4">
                    Add Emergency Contact
                  </h3>
                                    <div className="space-y-4">

                    <input
                      type="text"
                      placeholder="Full Name"
                      value={newContact.name}
                      onChange={(e) =>
                        setNewContact({
                          ...newContact,
                          name: e.target.value,
                        })
                      }
                      className={`w-full px-4 py-3 rounded-xl border outline-none transition ${
                        isNightMode
                          ? "bg-gray-900 border-gray-700 text-white focus:border-primary-500"
                          : "bg-white border-gray-300 focus:border-primary-500"
                      }`}
                    />

                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={newContact.phone}
                      onChange={(e) =>
                        setNewContact({
                          ...newContact,
                          phone: e.target.value,
                        })
                      }
                      className={`w-full px-4 py-3 rounded-xl border outline-none transition ${
                        isNightMode
                          ? "bg-gray-900 border-gray-700 text-white focus:border-primary-500"
                          : "bg-white border-gray-300 focus:border-primary-500"
                      }`}
                    />

                    <select
                      value={newContact.relationship}
                      onChange={(e) =>
                        setNewContact({
                          ...newContact,
                          relationship: e.target.value,
                        })
                      }
                      className={`w-full px-4 py-3 rounded-xl border outline-none transition ${
                        isNightMode
                          ? "bg-gray-900 border-gray-700 text-white focus:border-primary-500"
                          : "bg-white border-gray-300 focus:border-primary-500"
                      }`}
                    >
                      <option value="">Relationship</option>
                      <option value="Family">👨‍👩‍👧 Family</option>
                      <option value="Friend">🤝 Friend</option>
                      <option value="Spouse">❤️ Spouse</option>
                      <option value="Colleague">💼 Colleague</option>
                      <option value="Other">📍 Other</option>
                    </select>

                    <div className="flex gap-3 pt-2">

                      <button
                        onClick={() => setShowAddContact(false)}
                        className={`flex-1 py-3 rounded-xl font-semibold transition ${
                          isNightMode
                            ? "bg-gray-700 hover:bg-gray-600 text-white"
                            : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                        }`}
                      >
                        Cancel
                      </button>

                      <button
                        onClick={handleAddContact}
                        className="flex-1 py-3 rounded-xl font-semibold bg-primary-500 hover:bg-primary-600 text-white transition shadow-lg"
                      >
                        Save Contact
                      </button>
                      </div>

                    </div>

                  </div>

                )}

              </div>

            </div>

          </div>

        

      )}

    </>

  );
}
