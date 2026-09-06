import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/auth";

type ReviewBusiness = {
  id: string;
  slug: string;
  name: string;
  category: string;
  location: string;
  trustScore: number;
  rating: number;
  reviewsCount: number;
  image: string;
  description?: string;
};

type CompanyResponse = {
  id: string;
  slug: string;
  name: string;
  category?: string;
  location?: string;
  trustScore?: number;
  rating?: number;
  reviewsCount?: number;
  description?: string;
};

const fallbackImages = [
  "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1522204523234-8729aa6e65af?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
];

const ratingLabels = ["Poor", "Fair", "Good", "Very Good", "Excellent"];

export default function ReviewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { token } = useAuth();
  const [businesses, setBusinesses] = useState<ReviewBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRating, setSelectedRating] = useState(4);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [audioRecording, setAudioRecording] = useState<{
    data: string;
    durationSeconds: number;
    previewUrl: string;
  } | null>(null);
  const [photos, setPhotos] = useState<{ data: string; name: string }[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingStartedAtRef = useRef(0);
  const recordingSessionRef = useRef(0);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const [coordinates, setCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const qrToken = searchParams.get("qr") || "";

  const selectedSlug =
    searchParams.get("business") || businesses[0]?.slug || "";

  const selectedBusiness = useMemo(
    () =>
      businesses.find((business) => business.slug === selectedSlug) ??
      businesses[0],
    [businesses, selectedSlug],
  );

  useEffect(() => {
    if (!qrToken) {
      return;
    }
    if (!navigator.geolocation) {
      queueMicrotask(() =>
        setError("This browser cannot verify your location."),
      );
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) =>
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      () =>
        setError("Location access is required to submit a verified review."),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }, [qrToken]);

  const verificationMessage = error;

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch("/api/companies?sort=score&limit=30");
        const json = await resp.json();
        const mapped = (
          Array.isArray(json.companies) ? json.companies : []
        ).map((company: CompanyResponse, index: number) => ({
          id: company.id,
          slug: company.slug,
          name: company.name,
          category: company.category || "General",
          location: company.location || "Location unavailable",
          trustScore: Number(company.trustScore || 0),
          rating: Number(company.rating || 0),
          reviewsCount: Number(company.reviewsCount || 0),
          image: fallbackImages[index % fallbackImages.length],
          description: company.description,
        }));
        setBusinesses(mapped);
      } catch {
        setBusinesses([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const audioPlayer = audioPlayerRef.current;
    return () => {
      recordingSessionRef.current += 1;
      mediaRecorderRef.current?.stop();
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      mediaRecorderRef.current = null;
      mediaStreamRef.current = null;
      audioPlayer?.pause();
      if (audioRecording?.previewUrl) {
        URL.revokeObjectURL(audioRecording.previewUrl);
      }
    };
  }, [audioRecording]);

  async function handleSubmit() {
    if (!selectedBusiness) {
      setError("Please select a business first.");
      return;
    }

    if (selectedRating < 1 || selectedRating > 5) {
      setError("Choose a rating from 1 to 5 stars.");
      return;
    }

    if (reviewText.trim().length < 20 && !audioRecording) {
      setError(
        "Write at least 20 characters or add an audio recording about your experience.",
      );
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const resp = await fetch(
        `/api/companies/${selectedBusiness.slug}/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rating: selectedRating,
            review_text: reviewText.trim(),
            audio: audioRecording
              ? {
                  data: audioRecording.data,
                  durationSeconds: audioRecording.durationSeconds,
                }
              : null,
            photos,
            qr_token: qrToken,
            latitude: coordinates?.latitude,
            longitude: coordinates?.longitude,
          }),
        },
      );

      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        throw new Error(
          body.error || `Review submission failed (${resp.status})`,
        );
      }

      navigate(`/business/${selectedBusiness.slug}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Review submission failed. Please try again.",
      );
      setIsSubmitting(false);
    }
  }

  function clearAudioRecording() {
    if (audioRecording?.previewUrl) {
      URL.revokeObjectURL(audioRecording.previewUrl);
    }
    setAudioRecording(null);
    setIsPlaying(false);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
    }
  }

  async function startRecording() {
    if (isRecording) {
      stopRecording();
      return;
    }

    if (
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      setError("Audio recording is not supported by this browser.");
      return;
    }

    try {
      if (audioRecording) {
        clearAudioRecording();
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const recordingSession = ++recordingSessionRef.current;
      mediaStreamRef.current = stream;
      audioChunksRef.current = [];
      recordingStartedAtRef.current = Date.now();
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      recorder.onerror = () => {
        stream.getTracks().forEach((track) => track.stop());
        setIsRecording(false);
        setError("Audio recording failed. Please try again.");
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        if (mediaStreamRef.current === stream) mediaStreamRef.current = null;
        const blob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        const previewUrl = URL.createObjectURL(blob);
        if (recordingSession !== recordingSessionRef.current) {
          URL.revokeObjectURL(previewUrl);
          return;
        }
        const bytes = new Uint8Array(await blob.arrayBuffer());
        let binary = "";
        bytes.forEach((byte) => {
          binary += String.fromCharCode(byte);
        });
        setAudioRecording({
          data: `data:${blob.type};base64,${btoa(binary)}`,
          previewUrl,
          durationSeconds: Math.max(
            1,
            Math.round((Date.now() - recordingStartedAtRef.current) / 1000),
          ),
        });
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setError("");
    } catch {
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
      setError("Microphone access is required to record an audio review.");
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;
    setIsRecording(false);
  }

  function togglePlayback() {
    const player = audioPlayerRef.current;
    if (!player || !audioRecording) return;

    if (player.paused) {
      void player
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          setIsPlaying(false);
          setError("Audio playback could not start.");
        });
      return;
    }

    player.pause();
    setIsPlaying(false);
  }

  function handlePhotoSelection(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    if (files.length > 4 || photos.length + files.length > 4) {
      setError("You can upload at most 4 photos.");
      event.target.value = "";
      return;
    }
    const oversized = files.find((file) => file.size > 20 * 1024 * 1024);
    if (oversized) {
      setError(`${oversized.name} is larger than 20 MB.`);
      event.target.value = "";
      return;
    }
    if (files.some((file) => !file.type.startsWith("image/"))) {
      setError("Only image files can be uploaded.");
      event.target.value = "";
      return;
    }
    Promise.all(
      files.map(
        (file) =>
          new Promise<{ data: string; name: string }>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () =>
              resolve({ data: String(reader.result), name: file.name });
            reader.onerror = () => reject(new Error("Could not read photo"));
            reader.readAsDataURL(file);
          }),
      ),
    )
      .then((selected) => {
        setPhotos((current) => [...current, ...selected]);
        setError("");
      })
      .catch(() => setError("Could not read the selected photos."));
    event.target.value = "";
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#edf5fb] px-4">
        <div className="rounded-[28px] border border-[#dfeaf6] bg-white p-8 text-center shadow-[0_20px_50px_rgba(18,48,74,0.08)]">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-[4px] border-[#dfeaf6] border-t-[#2f68f1]" />
          <p className="mt-4 text-lg font-black text-[#12304a]">
            Loading review form…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#edf5fb] text-[#12304a]">
      <div className="mx-auto max-w-[760px] px-3 py-6 sm:px-5">
        <header className="mb-6 flex items-center justify-between rounded-[24px] bg-white/70 px-4 py-3 shadow-[0_14px_30px_rgba(18,48,74,0.08)] backdrop-blur-sm">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex size-10 items-center justify-center rounded-full border border-[#dfeaf5] bg-[#f7fafc] text-lg font-black text-[#12304a] shadow-sm transition hover:-translate-x-0.5 hover:shadow-md"
            aria-label="Back"
          >
            <i className="bi bi-arrow-left" />
          </button>
          <h1 className="text-2xl font-black tracking-[-0.04em]">
            Submit review
          </h1>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#dbe8f4] bg-[#eef4ff] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-[#2f68f1]">
            <span className="h-2 w-2 rounded-full bg-[#2f68f1]" />
            Customer review
          </div>
        </header>

        {selectedBusiness && (
          <div className="relative overflow-hidden rounded-[30px] border border-[#dfeaf6] bg-white shadow-[0_30px_90px_rgba(18,48,74,0.12)]">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `linear-gradient(135deg, rgba(18,48,74,0.52), rgba(18,48,74,0.2)), url(${selectedBusiness.image})`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0f2840]/70 via-[#12304a]/40 to-[#12304a]/10" />
            <div className="relative p-5 sm:p-6">
              <div className="flex items-center gap-4">
                <div className="flex size-14 items-center justify-center rounded-full border border-white/50 bg-white/10 backdrop-blur-sm text-xl font-black text-white shadow-lg">
                  {selectedBusiness.name.charAt(0)}
                </div>
                <div className="text-white">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-sky-100">
                    {selectedBusiness.category}
                  </p>
                  <h2 className="mt-1 text-2xl font-black tracking-[-0.04em] sm:text-3xl">
                    {selectedBusiness.name}
                  </h2>
                  <p className="mt-1 text-sm text-sky-100">
                    {selectedBusiness.location}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 rounded-[30px] border border-[#dfeaf6] bg-white p-5 shadow-[0_24px_70px_rgba(18,48,74,0.08)] sm:p-6">
          <div className="mb-6 text-center">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#7d97ad]">
              Overall experience
            </p>
            <div className="mt-4 flex justify-center gap-2 sm:gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setSelectedRating(star)}
                  className={`text-4xl transition duration-200 ${
                    star <= selectedRating
                      ? "scale-110 text-[#f4b740] drop-shadow-[0_8px_18px_rgba(244,183,64,0.35)]"
                      : "text-[#d5dfe8] hover:text-[#8bb3ff]"
                  }`}
                  aria-label={`Rate ${star} out of 5`}
                >
                  ★
                </button>
              ))}
            </div>
            <p className="mt-3 text-lg font-black text-[#12304a]">
              {ratingLabels[selectedRating - 1]}
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#7d97ad]">
                Tell us more
              </label>
              <textarea
                value={reviewText}
                onChange={(event) => setReviewText(event.target.value)}
                placeholder="What was the best part of your visit? How was the service?"
                className="min-h-[150px] w-full rounded-[22px] border border-[#dfeaf6] bg-[#f8fbff] p-4 text-base font-medium text-[#12304a] outline-none transition placeholder:text-[#8aa0b2] focus:border-[#2f68f1] focus:shadow-[0_0_0_4px_rgba(47,104,241,0.12)]"
              />
              <p className="mt-2 text-right text-[10px] font-black uppercase tracking-[0.18em] text-[#8aa0b2]">
                {reviewText.trim().length}/500
              </p>
            </div>

            <div className="rounded-[24px] border border-[#dfeaf6] bg-[#f7fafc] p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-black text-[#12304a]">
                    Location verification
                  </p>
                  <p className="text-sm text-[#647b8b]">
                    {coordinates
                      ? "Your location is ready to verify this visit."
                      : qrToken
                        ? "Location verification is optional for this review."
                        : "QR and location verification are optional."}
                  </p>
                </div>
                <i
                  className={`bi ${coordinates ? "bi-geo-alt-fill text-[#2f68f1]" : "bi-hourglass-split text-[#8aa0b2]"} text-2xl`}
                  aria-hidden="true"
                />
              </div>
            </div>

            <div className="rounded-[24px] border border-dashed border-[#d4e1ef] bg-[#f8fbff] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#7d97ad]">
                    Evidence
                  </p>
                  <p className="mt-1 text-sm text-[#647b8b]">
                    Add up to 4 photos to verify your claim.
                  </p>
                </div>
                <label className="cursor-pointer rounded-full border border-[#dfeaf6] bg-white px-4 py-2 text-sm font-black text-[#12304a] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    onChange={handlePhotoSelection}
                  />
                  Upload
                </label>
              </div>
              {photos.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {photos.map((photo, index) => (
                    <div
                      key={`${photo.name}-${index}`}
                      className="relative overflow-hidden rounded-xl border border-[#dfeaf6] bg-white"
                    >
                      <img
                        src={photo.data}
                        alt={photo.name}
                        className="aspect-square w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setPhotos((current) =>
                            current.filter(
                              (_, photoIndex) => photoIndex !== index,
                            ),
                          )
                        }
                        className="absolute right-1 top-1 grid size-7 place-items-center rounded-full bg-[#12304a]/80 text-white"
                        aria-label={`Remove ${photo.name}`}
                      >
                        <i className="bi bi-x" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-[24px] border border-[#dfeaf6] bg-[#f7fafc] p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#7d97ad]">
                    Audio review
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#647b8b]">
                    Record a short voice note instead of, or alongside, written
                    feedback.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-black text-white transition ${isRecording ? "bg-[#b33b4b]" : "bg-[#12304a]"}`}
                  >
                    <i
                      className={`bi ${isRecording ? "bi-stop-circle" : "bi-mic"}`}
                      aria-hidden="true"
                    />
                    {isRecording ? "Stop" : "Record"}
                  </button>
                  {audioRecording && (
                    <>
                      <button
                        type="button"
                        onClick={togglePlayback}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-[#dfeaf6] bg-white px-4 py-2 text-sm font-black text-[#12304a]"
                      >
                        <i
                          className={`bi ${isPlaying ? "bi-pause-circle" : "bi-play-circle"}`}
                          aria-hidden="true"
                        />
                        {isPlaying ? "Pause" : "Play"}
                      </button>
                      <button
                        type="button"
                        onClick={clearAudioRecording}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-[#f7c7c7] bg-[#fff3f3] px-4 py-2 text-sm font-black text-[#a63636]"
                      >
                        <i className="bi bi-trash" aria-hidden="true" />
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
              {audioRecording && (
                <div className="mt-4 flex items-center gap-3 rounded-xl bg-white p-3">
                  <audio
                    ref={audioPlayerRef}
                    controls
                    src={audioRecording.previewUrl}
                    className="min-w-0 flex-1"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                  />
                </div>
              )}
            </div>

            {verificationMessage && (
              <div className="rounded-[18px] border border-[#f7c7c7] bg-[#fff3f3] px-4 py-3 text-sm font-semibold text-[#a63636]">
                {verificationMessage}
              </div>
            )}

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="mt-2 w-full rounded-[22px] bg-gradient-to-r from-[#12304a] via-[#1c3e67] to-[#2f68f1] px-6 py-4 text-2xl font-black text-white shadow-[0_20px_55px_rgba(18,48,74,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_25px_60px_rgba(47,104,241,0.25)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Submitting..." : "Submit review"}
            </button>

            <p className="text-center text-xs font-semibold leading-5 text-[#7c8ea1]">
              By submitting, you agree to TRUSIQ&apos;s Content Guidelines and
              verify that this review is based on a real interaction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
