import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type AccountType = "customer" | "business";

const accountCopy = {
  customer: {
    eyebrow: "Customer account",
    title: "Join Trusiq as a customer",
    description:
      "Discover verified businesses and manage trust with clear, reliable insight.",
    submit: "Create Customer Account",
    fields: [
      {
        icon: "bi-person",
        label: "Full name",
        placeholder: "John Doe",
        type: "text",
      },
      {
        icon: "bi-envelope",
        label: "Email address",
        placeholder: "john@example.com",
        type: "email",
      },
    ],
  },
  business: {
    eyebrow: "Business account",
    title: "Register your business",
    description:
      "Build trust, verify your profile, and connect with customers more confidently.",
    submit: "Create Business Account",
    fields: [
      {
        icon: "bi-person",
        label: "Owner name",
        placeholder: "Jane Mensah",
        type: "text",
      },
      {
        icon: "bi-building",
        label: "Business name",
        placeholder: "Kora Kitchen",
        type: "text",
      },
      {
        icon: "bi-tags",
        label: "Business category",
        placeholder: "Restaurant, retail, service...",
        type: "text",
      },
      {
        icon: "bi-geo-alt",
        label: "Business location",
        placeholder: "East Legon, Accra",
        type: "text",
      },
      {
        icon: "bi-telephone",
        label: "Contact phone",
        placeholder: "+233 24 000 0000",
        type: "tel",
      },
      {
        icon: "bi-globe",
        label: "Website or profile link",
        placeholder: "https://yourbusiness.com",
        type: "url",
      },
      {
        icon: "bi-envelope",
        label: "Business email",
        placeholder: "hello@business.com",
        type: "email",
      },
    ],
  },
};

const trustBenefits = [
  "Verified profile for business trust",
  "Access to reputational insights",
  "Simple onboarding with secure controls",
];

export function RegistrationPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [accountType, setAccountType] = useState<AccountType>("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessCategory, setBusinessCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([
    "General",
    "Restaurants",
    "Services",
    "IT Services",
    "Retail",
  ]);
  const [customCategory, setCustomCategory] = useState("");
  const [businessLocation, setBusinessLocation] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessWebsite, setBusinessWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const copy = accountCopy[accountType];

  useEffect(() => {
    (async function loadCategories() {
      try {
        const resp = await fetch("/api/companies/categories");
        if (!resp.ok) return;
        const json = await resp.json();
        if (Array.isArray(json.categories) && json.categories.length) {
          setCategories(json.categories);
        }
      } catch (e) {
        // ignore and keep defaults
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f9fc] text-[#12304a]">
      <div className="trusiq-shell min-h-screen flex flex-col justify-center px-4 py-10">
        <main className="mx-auto grid w-full max-w-[1240px] gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="relative rounded-[36px] bg-[#12304a] px-10 py-10 text-white shadow-[0_24px_90px_rgba(18,48,74,0.18)] sm:px-10 sm:py-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_18%),radial-gradient(circle_at_bottom_right,rgba(94,161,255,0.12),transparent_28%)]" />
            <div className="relative z-20 flex flex-col justify-center gap-10 h-full">
              <div className="overflow-hidden rounded-[28px] bg-[url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center">
                <div className="h-56 bg-gradient-to-t from-[#12304a]/95 via-[#12304a]/70 to-transparent px-6 py-6 flex items-end">
                  <div className="max-w-xl">
                    <h2 className="mt-3 text-3xl font-black leading-tight text-white sm:text-4xl">
                      Build trust with a polished business presentation.
                    </h2>
                  </div>
                </div>
              </div>

              <div className="space-y-5 text-left">
                <div className="inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-[#c6def9]">
                  <i className="bi bi-building" aria-hidden="true" />
                  Trusted business onboarding
                </div>
                <div>
                  <h1 className="text-4xl font-black leading-tight tracking-[-0.05em] sm:text-5xl">
                    {copy.title}
                  </h1>
                  <p className="mt-5 max-w-2xl text-base leading-7 text-[#d4e6f7]">
                    {copy.description}
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                {trustBenefits.map((benefit) => (
                  <div
                    key={benefit}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm"
                  >
                    <p className="text-sm font-black text-[#e9f5ff]">
                      {benefit}
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="relative overflow-hidden rounded-2xl bg-[#134468]/85 p-6">
                  <div className="relative z-10">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#b8d7f0]">
                      Stay verified
                    </p>
                    <p className="mt-3 text-sm leading-6 text-[#d4e6f7]">
                      Help customers choose your business with a clean, verified
                      presence.
                    </p>
                  </div>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#12304a]/60 to-transparent" />
                </div>

                <div className="relative overflow-hidden rounded-2xl bg-[#1b4f77]/85 p-6">
                  <div className="relative z-10">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#b8d7f0]">
                      Build trust fast
                    </p>
                    <p className="mt-3 text-sm leading-6 text-[#d4e6f7]">
                      A smooth registration path helps your business earn
                      reputation quickly.
                    </p>
                  </div>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#12304a]/60 to-transparent" />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[36px] bg-white p-8 shadow-[0_24px_70px_rgba(18,48,74,0.08)] sm:p-10">
            <div className="mb-8 text-center">
              <p className="text-sm font-black uppercase tracking-[0.24em] text-[#657b8b]">
                {accountType === "customer"
                  ? "Customer registration"
                  : "Business registration"}
              </p>
              <h2 className="mt-4 text-3xl font-black text-[#12304a]">
                Create your account
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#657b8b]">
                {accountType === "customer"
                  ? "Join Trusiq and discover trusted businesses."
                  : "Claim your business and start building your trusted profile."}
              </p>
            </div>

            <div className="grid gap-3 rounded-[24px] bg-[#d8e6ef] p-4 sm:grid-cols-2">
              <ModeButton
                active={accountType === "customer"}
                icon="bi-person"
                label="Customer"
                onClick={() => setAccountType("customer")}
              />
              <ModeButton
                active={accountType === "business"}
                icon="bi-briefcase"
                label="Business"
                onClick={() => setAccountType("business")}
              />
            </div>

            <form
              className="mt-6 grid gap-5"
              onSubmit={async (event) => {
                event.preventDefault();

                const effectiveBusinessName =
                  accountType === "business" ? businessName || name : name;

                if (!name || !email || !password) {
                  alert("Please fill in all required fields.");
                  return;
                }

                if (
                  accountType === "business" &&
                  (!effectiveBusinessName ||
                    !businessCategory ||
                    !businessLocation)
                ) {
                  alert(
                    "Please complete the business name, category, and location.",
                  );
                  return;
                }

                if (password !== confirmPassword) {
                  alert("Passwords do not match.");
                  return;
                }

                try {
                  const resp = await fetch("/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      name,
                      email,
                      password,
                      roles:
                        accountType === "business" ? ["owner"] : ["customer"],
                    }),
                  });

                  if (!resp.ok) {
                    const err = await resp.json().catch(() => ({}));
                    alert(err.error || "Registration failed");
                    return;
                  }

                  const body = await resp.json();
                  setAuth(body.user, body.token);

                  if (accountType === "business") {
                    const chosenCategory =
                      businessCategory === "Other"
                        ? customCategory || "General"
                        : businessCategory || "General";
                    const companyResponse = await fetch(
                      "/api/companies/register",
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${body.token}`,
                        },
                        body: JSON.stringify({
                          name: effectiveBusinessName,
                          category: chosenCategory,
                          location: businessLocation || "Not set yet",
                          website: businessWebsite || "",
                          phone: businessPhone || "",
                          description:
                            "Business profile created during signup.",
                        }),
                      },
                    );

                    if (!companyResponse.ok) {
                      const companyErr = await companyResponse
                        .json()
                        .catch(() => ({}));
                      console.warn(
                        "Business profile creation failed:",
                        companyErr.error || companyResponse.statusText,
                      );
                    }
                  }

                  navigate(
                    body.user.roles.includes("owner")
                      ? "/dashboard"
                      : "/search",
                  );
                } catch (error) {
                  alert("Registration error");
                }
              }}
            >
              <div className="grid gap-5">
                {accountType === "business" ? (
                  <>
                    <label className="grid gap-2">
                      <span className="text-sm font-black text-[#12304a]">
                        Owner name
                      </span>
                      <span className="flex h-12 items-center gap-3 rounded-xl border border-[#d8e6ef] bg-[#f8fbff] px-4">
                        <i
                          className="bi bi-person text-lg text-[#657b8b]"
                          aria-hidden="true"
                        />
                        <input
                          className="min-w-0 flex-1 bg-transparent text-[15px] font-semibold text-[#12304a] outline-none placeholder:text-[#657b8b]"
                          placeholder="Jane Mensah"
                          type="text"
                          value={name}
                          onChange={(event) => setName(event.target.value)}
                        />
                      </span>
                    </label>

                    <label className="grid gap-2">
                      <span className="text-sm font-black text-[#12304a]">
                        Business name
                      </span>
                      <span className="flex h-12 items-center gap-3 rounded-xl border border-[#d8e6ef] bg-[#f8fbff] px-4">
                        <i
                          className="bi bi-building text-lg text-[#657b8b]"
                          aria-hidden="true"
                        />
                        <input
                          className="min-w-0 flex-1 bg-transparent text-[15px] font-semibold text-[#12304a] outline-none placeholder:text-[#657b8b]"
                          placeholder="Kora Kitchen"
                          type="text"
                          value={businessName}
                          onChange={(event) =>
                            setBusinessName(event.target.value)
                          }
                        />
                      </span>
                    </label>

                    <label className="grid gap-2">
                      <span className="text-sm font-black text-[#12304a]">
                        Business category
                      </span>
                      <span className="flex h-12 items-center gap-3 rounded-xl border border-[#d8e6ef] bg-[#f8fbff] px-4">
                        <i
                          className="bi bi-tags text-lg text-[#657b8b]"
                          aria-hidden="true"
                        />
                        <select
                          className="min-w-0 flex-1 bg-transparent text-[15px] font-semibold text-[#12304a] outline-none"
                          value={businessCategory || ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            if (v === "__other__") {
                              setBusinessCategory("Other");
                            } else {
                              setBusinessCategory(v);
                              setCustomCategory("");
                            }
                          }}
                        >
                          <option value="">Select category</option>
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                          <option value="__other__">Other</option>
                        </select>
                      </span>
                      {businessCategory === "Other" && (
                        <input
                          className="mt-2 min-w-0 flex-1 bg-transparent text-[15px] font-semibold text-[#12304a] outline-none placeholder:text-[#657b8b] rounded-xl border border-[#d8e6ef] px-4 py-2"
                          placeholder="Type a custom category"
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                        />
                      )}
                    </label>

                    <label className="grid gap-2">
                      <span className="text-sm font-black text-[#12304a]">
                        Business location
                      </span>
                      <span className="flex h-12 items-center gap-3 rounded-xl border border-[#d8e6ef] bg-[#f8fbff] px-4">
                        <i
                          className="bi bi-geo-alt text-lg text-[#657b8b]"
                          aria-hidden="true"
                        />
                        <input
                          className="min-w-0 flex-1 bg-transparent text-[15px] font-semibold text-[#12304a] outline-none placeholder:text-[#657b8b]"
                          placeholder="East Legon, Accra"
                          type="text"
                          value={businessLocation}
                          onChange={(event) =>
                            setBusinessLocation(event.target.value)
                          }
                        />
                      </span>
                    </label>

                    <label className="grid gap-2">
                      <span className="text-sm font-black text-[#12304a]">
                        Phone number
                      </span>
                      <span className="flex h-12 items-center gap-3 rounded-xl border border-[#d8e6ef] bg-[#f8fbff] px-4">
                        <i
                          className="bi bi-telephone text-lg text-[#657b8b]"
                          aria-hidden="true"
                        />
                        <input
                          className="min-w-0 flex-1 bg-transparent text-[15px] font-semibold text-[#12304a] outline-none placeholder:text-[#657b8b]"
                          placeholder="+233 24 000 0000"
                          type="tel"
                          value={businessPhone}
                          onChange={(event) =>
                            setBusinessPhone(event.target.value)
                          }
                        />
                      </span>
                    </label>

                    <label className="grid gap-2">
                      <span className="text-sm font-black text-[#12304a]">
                        Website
                      </span>
                      <span className="flex h-12 items-center gap-3 rounded-xl border border-[#d8e6ef] bg-[#f8fbff] px-4">
                        <i
                          className="bi bi-globe text-lg text-[#657b8b]"
                          aria-hidden="true"
                        />
                        <input
                          className="min-w-0 flex-1 bg-transparent text-[15px] font-semibold text-[#12304a] outline-none placeholder:text-[#657b8b]"
                          placeholder="https://yourbusiness.com"
                          type="url"
                          value={businessWebsite}
                          onChange={(event) =>
                            setBusinessWebsite(event.target.value)
                          }
                        />
                      </span>
                    </label>
                  </>
                ) : (
                  <label className="grid gap-2">
                    <span className="text-sm font-black text-[#12304a]">
                      Full name
                    </span>
                    <span className="flex h-12 items-center gap-3 rounded-xl border border-[#d8e6ef] bg-[#f8fbff] px-4">
                      <i
                        className="bi bi-person text-lg text-[#657b8b]"
                        aria-hidden="true"
                      />
                      <input
                        className="min-w-0 flex-1 bg-transparent text-[15px] font-semibold text-[#12304a] outline-none placeholder:text-[#657b8b]"
                        placeholder="John Doe"
                        type="text"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                      />
                    </span>
                  </label>
                )}

                <label className="grid gap-2">
                  <span className="text-sm font-black text-[#12304a]">
                    Email address
                  </span>
                  <span className="flex h-12 items-center gap-3 rounded-xl border border-[#d8e6ef] bg-[#f8fbff] px-4">
                    <i
                      className="bi bi-envelope text-lg text-[#657b8b]"
                      aria-hidden="true"
                    />
                    <input
                      className="min-w-0 flex-1 bg-transparent text-[15px] font-semibold text-[#12304a] outline-none placeholder:text-[#657b8b]"
                      placeholder={
                        accountType === "business"
                          ? "hello@business.com"
                          : "john@example.com"
                      }
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </span>
                </label>
              </div>

              <label className="grid gap-2">
                <span className="text-sm font-black text-[#12304a]">
                  Password
                </span>
                <span className="flex h-12 items-center gap-3 rounded-xl border border-[#d8e6ef] bg-[#f8fbff] px-4">
                  <i
                    className="bi bi-lock text-lg text-[#657b8b]"
                    aria-hidden="true"
                  />
                  <input
                    className="min-w-0 flex-1 bg-transparent text-[15px] font-semibold text-[#12304a] outline-none placeholder:text-[#657b8b]"
                    placeholder="Create a strong password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <button
                    className="text-lg text-[#657b8b] transition hover:text-[#12304a]"
                    type="button"
                    aria-label="Toggle password visibility"
                    onClick={() => setShowPassword((value) => !value)}
                  >
                    <i
                      className={`bi ${showPassword ? "bi-eye" : "bi-eye-slash"}`}
                      aria-hidden="true"
                    />
                  </button>
                </span>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-black text-[#12304a]">
                  Confirm password
                </span>
                <span className="flex h-12 items-center gap-3 rounded-xl border border-[#d8e6ef] bg-[#f8fbff] px-4">
                  <i
                    className="bi bi-shield-check text-lg text-[#657b8b]"
                    aria-hidden="true"
                  />
                  <input
                    className="min-w-0 flex-1 bg-transparent text-[15px] font-semibold text-[#12304a] outline-none placeholder:text-[#657b8b]"
                    placeholder="Repeat your password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                  />
                  <button
                    className="text-lg text-[#657b8b] transition hover:text-[#12304a]"
                    type="button"
                    aria-label="Toggle confirm password visibility"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                  >
                    <i
                      className={`bi ${showConfirmPassword ? "bi-eye" : "bi-eye-slash"}`}
                      aria-hidden="true"
                    />
                  </button>
                </span>
              </label>

              <button
                className="mt-2 flex h-14 w-full items-center justify-center rounded-3xl bg-[#12304a] text-base font-black text-white shadow-[0_18px_32px_rgba(18,48,74,0.18)] transition hover:bg-[#0f283f] active:translate-y-0.5"
                type="submit"
              >
                {copy.submit}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.18em] text-[#b09b88]">
              <span className="h-px flex-1 bg-[#d8e6ef]" />
              or
              <span className="h-px flex-1 bg-[#d8e6ef]" />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <ProviderButton icon="bi-google" label="Google" />
              <ProviderButton icon="bi-apple" label="Apple / iCloud" />
              <ProviderButton icon="bi-microsoft" label="Microsoft" />
            </div>

            <p className="mt-6 text-center text-sm font-semibold text-[#657b8b]">
              Already have an account?{" "}
              <Link
                className="font-black text-[#12304a] transition hover:text-[#0f283f]"
                to="/login"
              >
                Sign in
              </Link>
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}

function ProviderButton({ icon, label }: { icon: string; label: string }) {
  return (
    <button
      className="flex h-12 items-center justify-center gap-2 rounded-xl border border-[#d8e6ef] bg-white px-4 text-sm font-black text-[#12304a] transition hover:-translate-y-0.5 hover:border-[#7eb8df] hover:bg-[#f4f9fc] active:translate-y-0"
      type="button"
    >
      <i className={`bi ${icon}`} aria-hidden="true" />
      {label}
    </button>
  );
}

function ModeButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 text-sm font-black transition ${
        active
          ? "bg-white text-[#12304a] shadow-sm"
          : "text-[#657b8b] hover:bg-white/70 hover:text-[#12304a]"
      }`}
      type="button"
      onClick={onClick}
    >
      <i className={`bi ${icon}`} aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}
