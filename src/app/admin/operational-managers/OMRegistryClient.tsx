"use client";

import {
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { createPortal } from "react-dom";

import {
  Activity,
  AlertCircle,
  Award,
  Briefcase,
  CalendarDays,
  Check,
  ChevronDown,
  Edit3,
  Filter,
  KeyRound,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UserCheck,
  Users,
  UserX,
  X,
} from "lucide-react";

import {
  createOperationalManager,
  resetOMPassword,
  updateOMEmploymentStatus,
  updateOperationalManager,
} from "./actions";

interface OMProfile {
  id: string;
  employee_id: string;
  designation: string;
  assigned_regions: string[];
  assigned_cities: string[];
  availability_status: string;
  employment_status: string;
  joining_date: string;
  current_workload: number;
  performance_score: number;
  completion_rate: number;
  profile_photo: string | null;

  profiles: {
    id: string;
    full_name: string;
    email: string;
    phone_number: string;
    address: string | null;
  } | null;
}

interface OMRegistryClientProps {
  initialManagers: OMProfile[];
  databasePending?: boolean;
}

type FilterType =
  | "All"
  | "Active"
  | "Available"
  | "Busy"
  | "Onboarding"
  | "Suspended";

const FILTERS: FilterType[] = [
  "All",
  "Active",
  "Available",
  "Busy",
  "Onboarding",
  "Suspended",
];

const REGIONS = ["North", "South", "East", "West", "Central"];

const CITIES = [
  "Hyderabad",
  "Bangalore",
  "Chennai",
  "Mumbai",
  "Delhi",
];

export default function OMRegistryClient({
  initialManagers,
  databasePending = false,
}: OMRegistryClientProps) {
  const [managers] = useState<OMProfile[]>(initialManagers);
  const [isPending, startTransition] = useTransition();

  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [editOM, setEditOM] = useState<OMProfile | null>(null);

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] =
    useState<FilterType>("All");

  // ================================================================
  // CREATE FORM
  // ================================================================

  const [fullName, setFullName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [designation, setDesignation] = useState("Coordinator");
  const [regions, setRegions] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [address, setAddress] = useState("");
  const [joiningDate, setJoiningDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [tempPassword, setTempPassword] =
    useState("Test@123");

  useEffect(() => {
    setMounted(true);
  }, []);

  const resetForm = () => {
    setFullName("");
    setEmployeeId("");
    setEmail("");
    setPhone("");
    setDesignation("Coordinator");
    setRegions([]);
    setCities([]);
    setAddress("");
    setJoiningDate(
      new Date().toISOString().split("T")[0]
    );
    setTempPassword("Test@123");
  };

  // ================================================================
  // FILTERING
  // ================================================================

  const filteredManagers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return managers.filter((manager) => {
      const profile = manager.profiles;

      const searchable = [
        profile?.full_name,
        profile?.email,
        profile?.phone_number,
        manager.employee_id,
        manager.designation,
        ...(manager.assigned_regions || []),
        ...(manager.assigned_cities || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchable.includes(query);

      let matchesFilter = true;

      switch (activeFilter) {
        case "Active":
          matchesFilter =
            manager.employment_status === "Active";
          break;

        case "Available":
          matchesFilter =
            manager.availability_status === "Available";
          break;

        case "Busy":
          matchesFilter =
            manager.availability_status === "Busy";
          break;

        case "Onboarding":
          matchesFilter =
            manager.employment_status === "Onboarding";
          break;

        case "Suspended":
          matchesFilter =
            manager.employment_status === "Suspended";
          break;

        default:
          matchesFilter = true;
      }

      return matchesSearch && matchesFilter;
    });
  }, [managers, search, activeFilter]);

  // ================================================================
  // EXISTING ACTIONS
  // ================================================================

  const handleCreate = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!fullName || !employeeId || !email || !phone) {
      alert("Please fill in all required fields.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await createOperationalManager({
          fullName,
          employeeId,
          email,
          phone,
          designation,
          regions,
          cities,
          address,
          joiningDate,
          temporaryPassword:
            tempPassword || undefined,
        });

        if (res.success) {
          alert(
            "Operational Manager account created! An activation notification has been generated."
          );

          setIsAdding(false);
          resetForm();
          window.location.reload();
        }
      } catch (err: any) {
        alert(
          err.message ||
          "Failed to create manager."
        );
      }
    });
  };

  const handleEditSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!editOM) return;

    startTransition(async () => {
      try {
        const res =
          await updateOperationalManager(
            editOM.id,
            {
              fullName:
                editOM.profiles?.full_name || "",
              phone:
                editOM.profiles?.phone_number || "",
              address:
                editOM.profiles?.address || "",
              designation: editOM.designation,
              regions: editOM.assigned_regions,
              cities: editOM.assigned_cities,
              availabilityStatus:
                editOM.availability_status as any,
              employmentStatus:
                editOM.employment_status as any,
              profilePhoto:
                editOM.profile_photo || undefined,
            }
          );

        if (res.success) {
          alert(
            "Operational Manager profile updated."
          );

          setIsEditing(false);
          setEditOM(null);
          window.location.reload();
        }
      } catch (err: any) {
        alert(
          err.message ||
          "Failed to update profile."
        );
      }
    });
  };

  const handleStatusChange = async (
    omId: string,
    nextStatus: OMProfile["employment_status"]
  ) => {
    if (
      !confirm(
        `Are you sure you want to transition this manager's employment status to ${nextStatus}?`
      )
    ) {
      return;
    }

    startTransition(async () => {
      try {
        await updateOMEmploymentStatus(
          omId,
          nextStatus as any
        );

        alert(`Status updated to ${nextStatus}.`);
        window.location.reload();
      } catch (err: any) {
        alert(
          err.message ||
          "Failed to change status."
        );
      }
    });
  };

  const handlePasswordReset = async (
    om: OMProfile
  ) => {
    if (
      !confirm(
        `Trigger password reset request for ${om.profiles?.full_name}? This will send a reset password email link.`
      )
    ) {
      return;
    }

    startTransition(async () => {
      try {
        await resetOMPassword(
          om.id,
          om.profiles?.email || ""
        );

        alert(
          "Password reset request sent successfully."
        );
      } catch (err: any) {
        alert(
          err.message ||
          "Failed to request password reset."
        );
      }
    });
  };

  const toggleRegion = (region: string) => {
    setRegions((previous) =>
      previous.includes(region)
        ? previous.filter(
          (item) => item !== region
        )
        : [...previous, region]
    );
  };

  const toggleCity = (city: string) => {
    setCities((previous) =>
      previous.includes(city)
        ? previous.filter(
          (item) => item !== city
        )
        : [...previous, city]
    );
  };

  // ================================================================
  // RENDER
  // ================================================================

  return (
    <div className="space-y-6">

      {/* ============================================================
          DATABASE NOTICE
      ============================================================ */}

      {databasePending && (
        <div
          className="
            relative overflow-hidden
            border border-amber-500/20
            bg-amber-500/[0.05]
            px-4 py-4
            sm:px-5
          "
        >
          <span className="absolute left-0 top-0 h-full w-[2px] bg-amber-500" />

          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />

            <div>
              <span
                className="
                  text-[8px] font-bold uppercase
                  tracking-[0.25em]
                  text-amber-500
                "
              >
                Database Migration Required
              </span>

              <p className="mt-1 text-[10px] leading-5 text-muted-foreground">
                Operations Team is running on mock
                data. Run{" "}
                <code className="text-foreground">
                  migration_milestone_2.sql
                </code>{" "}
                to connect and register real
                employees.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          REGISTRY CONTROL BAR
      ============================================================ */}

      <section
        className="
          border border-border
          bg-surface/50
        "
      >
        {/* top */}

        <div
          className="
            flex flex-col gap-4
            border-b border-border
            p-4 sm:p-5
            xl:flex-row
            xl:items-center
            xl:justify-between
          "
        >
          <div>
            <div className="flex items-center gap-2.5">
              <Users className="h-4 w-4 text-accent-gold" />

              <span
                className="
                  text-[8px] font-bold uppercase
                  tracking-[0.28em]
                  text-accent-gold
                "
              >
                Manager Registry
              </span>
            </div>

            <p className="mt-1.5 text-[10px] text-muted-foreground">
              {filteredManagers.length} of{" "}
              {managers.length} operational managers
            </p>
          </div>

          <div
            className="
              flex flex-col gap-2.5
              sm:flex-row
              sm:items-center
            "
          >
            {/* SEARCH */}

            <div
              className="
                relative
                w-full
                sm:w-[280px]
              "
            >
              <Search
                className="
                  absolute left-3 top-1/2
                  h-3.5 w-3.5
                  -translate-y-1/2
                  text-muted-foreground
                "
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search manager, city, ID..."
                className="
                  h-10 w-full
                  border border-border
                  bg-background/70
                  pl-9 pr-9
                  text-[10px]
                  text-foreground
                  outline-none
                  transition-all
                  placeholder:text-muted-foreground/50

                  focus:border-accent-gold/50
                  focus:ring-2
                  focus:ring-accent-gold/[0.06]
                "
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="
                    absolute right-3 top-1/2
                    -translate-y-1/2
                    text-muted-foreground
                    transition-colors
                    hover:text-foreground
                  "
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* ONBOARD */}

            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="
                group
                flex h-10
                items-center justify-center
                gap-2.5
                bg-accent-gold
                px-4
                text-[8px]
                font-bold uppercase
                tracking-[0.2em]
                text-black
                transition-all duration-300

                hover:brightness-105
                active:scale-[0.98]

                sm:justify-start
              "
            >
              <Plus
                className="
                  h-3.5 w-3.5
                  transition-transform duration-300
                  group-hover:rotate-90
                "
              />

              Onboard Manager
            </button>
          </div>
        </div>

        {/* filters */}

        <div
          className="
            flex items-center gap-2
            overflow-x-auto
            px-4 py-3
            sm:px-5

            [&::-webkit-scrollbar]:hidden
          "
        >
          <SlidersHorizontal className="mr-1 h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />

          {FILTERS.map((filter) => {
            const active =
              activeFilter === filter;

            return (
              <button
                key={filter}
                type="button"
                onClick={() =>
                  setActiveFilter(filter)
                }
                className={`
                  shrink-0
                  border
                  px-3 py-1.5
                  text-[7px]
                  font-bold uppercase
                  tracking-[0.18em]
                  transition-all duration-300

                  ${active
                    ? "border-accent-gold bg-accent-gold text-black"
                    : "border-border bg-background/40 text-muted-foreground hover:border-accent-gold/30 hover:text-foreground"
                  }
                `}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </section>

      {/* ============================================================
          MANAGER CARDS
      ============================================================ */}

      {filteredManagers.length === 0 ? (
        <EmptyState
          hasManagers={managers.length > 0}
          clearFilters={() => {
            setSearch("");
            setActiveFilter("All");
          }}
          addManager={() => setIsAdding(true)}
        />
      ) : (
        <div
          className="
            grid
            grid-cols-1
            gap-4

            md:grid-cols-2
            2xl:grid-cols-3
          "
        >
          {filteredManagers.map(
            (om, index) => (
              <ManagerCard
                key={om.id}
                manager={om}
                index={index}
                onEdit={() => {
                  setEditOM(om);
                  setIsEditing(true);
                }}
                onPasswordReset={() =>
                  handlePasswordReset(om)
                }
                onStatusChange={(status) =>
                  handleStatusChange(
                    om.id,
                    status
                  )
                }
              />
            )
          )}
        </div>
      )}

      {/* ============================================================
          CREATE MODAL
      ============================================================ */}

      {isAdding &&
        mounted &&
        createPortal(
          <ModalShell
            title="Onboard Operational Manager"
            eyebrow="New Workforce Record"
            description="Create an internal Operational Manager account and define their initial operational coverage."
            onClose={() => {
              setIsAdding(false);
              resetForm();
            }}
          >
            <form
              onSubmit={handleCreate}
              className="space-y-6"
            >
              <FormSection
                number="01"
                title="Identity"
                description="Basic employee information"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field
                    label="Full Name"
                    required
                  >
                    <input
                      required
                      value={fullName}
                      onChange={(e) =>
                        setFullName(
                          e.target.value
                        )
                      }
                      className={inputClass}
                      placeholder="Full employee name"
                    />
                  </Field>

                  <Field
                    label="Employee ID"
                    required
                  >
                    <input
                      required
                      value={employeeId}
                      onChange={(e) =>
                        setEmployeeId(
                          e.target.value
                        )
                      }
                      className={inputClass}
                      placeholder="OM-2026-X"
                    />
                  </Field>

                  <Field
                    label="Email Address"
                    required
                  >
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      className={inputClass}
                      placeholder="manager@sai.events"
                    />
                  </Field>

                  <Field
                    label="Phone Number"
                    required
                  >
                    <input
                      required
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value)
                      }
                      className={inputClass}
                      placeholder="+91..."
                    />
                  </Field>
                </div>
              </FormSection>

              <FormSection
                number="02"
                title="Employment"
                description="Role and joining information"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Designation">
                    <input
                      value={designation}
                      onChange={(e) =>
                        setDesignation(
                          e.target.value
                        )
                      }
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Joining Date">
                    <input
                      type="date"
                      value={joiningDate}
                      onChange={(e) =>
                        setJoiningDate(
                          e.target.value
                        )
                      }
                      className={inputClass}
                    />
                  </Field>
                </div>

                <Field
                  label="Temporary Password"
                  required
                >
                  <input
                    type="password"
                    required
                    value={tempPassword}
                    onChange={(e) =>
                      setTempPassword(
                        e.target.value
                      )
                    }
                    className={inputClass}
                    placeholder="Minimum 8 characters"
                  />
                </Field>
              </FormSection>

              <FormSection
                number="03"
                title="Operational Coverage"
                description="Assign regions and cities"
              >
                <SelectionGroup
                  label="Regions"
                  options={REGIONS}
                  selected={regions}
                  toggle={toggleRegion}
                />

                <SelectionGroup
                  label="Cities"
                  options={CITIES}
                  selected={cities}
                  toggle={toggleCity}
                />
              </FormSection>

              <FormSection
                number="04"
                title="Contact Location"
                description="Employee address"
              >
                <Field label="Address">
                  <textarea
                    value={address}
                    onChange={(e) =>
                      setAddress(e.target.value)
                    }
                    className={`${inputClass} min-h-[90px] resize-none py-3`}
                    placeholder="Employee home address..."
                  />
                </Field>
              </FormSection>

              <div
                className="
                  sticky bottom-0
                  -mx-5 -mb-5
                  border-t border-border
                  bg-background/95
                  p-4
                  backdrop-blur-xl

                  sm:-mx-7 sm:-mb-7 sm:p-5
                "
              >
                <button
                  type="submit"
                  disabled={isPending}
                  className="
                    flex h-12 w-full
                    items-center justify-center
                    gap-2
                    bg-accent-gold
                    text-[8px]
                    font-bold uppercase
                    tracking-[0.22em]
                    text-black
                    transition-all

                    hover:brightness-105
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {isPending ? (
                    <>
                      <Activity className="h-3.5 w-3.5 animate-pulse" />
                      Creating Account
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-3.5 w-3.5" />
                      Register Operational Manager
                    </>
                  )}
                </button>
              </div>
            </form>
          </ModalShell>,
          document.body
        )}

      {/* ============================================================
          EDIT MODAL
      ============================================================ */}

      {isEditing &&
        editOM &&
        mounted &&
        createPortal(
          <ModalShell
            title="Edit Manager Profile"
            eyebrow={editOM.employee_id}
            description="Update workforce information, coverage and current availability."
            onClose={() => {
              setIsEditing(false);
              setEditOM(null);
            }}
          >
            <form
              onSubmit={handleEditSubmit}
              className="space-y-6"
            >
              <FormSection
                number="01"
                title="Identity"
                description="Manager profile information"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Full Name">
                    <input
                      required
                      value={
                        editOM.profiles
                          ?.full_name || ""
                      }
                      onChange={(e) =>
                        setEditOM({
                          ...editOM,
                          profiles:
                            editOM.profiles
                              ? {
                                ...editOM.profiles,
                                full_name:
                                  e.target
                                    .value,
                              }
                              : null,
                        })
                      }
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Phone Number">
                    <input
                      required
                      value={
                        editOM.profiles
                          ?.phone_number || ""
                      }
                      onChange={(e) =>
                        setEditOM({
                          ...editOM,
                          profiles:
                            editOM.profiles
                              ? {
                                ...editOM.profiles,
                                phone_number:
                                  e.target
                                    .value,
                              }
                              : null,
                        })
                      }
                      className={inputClass}
                    />
                  </Field>
                </div>
              </FormSection>

              <FormSection
                number="02"
                title="Operations"
                description="Designation and availability"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Designation">
                    <input
                      value={editOM.designation}
                      onChange={(e) =>
                        setEditOM({
                          ...editOM,
                          designation:
                            e.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Availability">
                    <div className="relative">
                      <select
                        value={
                          editOM.availability_status
                        }
                        onChange={(e) =>
                          setEditOM({
                            ...editOM,
                            availability_status:
                              e.target.value,
                          })
                        }
                        className={`${inputClass} appearance-none pr-10`}
                      >
                        <option value="Available">
                          Available
                        </option>
                        <option value="Busy">
                          Busy
                        </option>
                        <option value="On Leave">
                          On Leave
                        </option>
                        <option value="Training">
                          Training
                        </option>
                        <option value="Inactive">
                          Inactive
                        </option>
                      </select>

                      <ChevronDown
                        className="
                          pointer-events-none
                          absolute right-3 top-1/2
                          h-3.5 w-3.5
                          -translate-y-1/2
                          text-muted-foreground
                        "
                      />
                    </div>
                  </Field>
                </div>
              </FormSection>

              <FormSection
                number="03"
                title="Coverage"
                description="Regional responsibilities"
              >
                <Field label="Regions">
                  <input
                    value={editOM.assigned_regions.join(
                      ", "
                    )}
                    onChange={(e) =>
                      setEditOM({
                        ...editOM,
                        assigned_regions:
                          e.target.value
                            .split(",")
                            .map((item) =>
                              item.trim()
                            )
                            .filter(Boolean),
                      })
                    }
                    className={inputClass}
                    placeholder="South, North"
                  />
                </Field>

                <Field label="Cities">
                  <input
                    value={editOM.assigned_cities.join(
                      ", "
                    )}
                    onChange={(e) =>
                      setEditOM({
                        ...editOM,
                        assigned_cities:
                          e.target.value
                            .split(",")
                            .map((item) =>
                              item.trim()
                            )
                            .filter(Boolean),
                      })
                    }
                    className={inputClass}
                    placeholder="Hyderabad, Bangalore"
                  />
                </Field>
              </FormSection>

              <FormSection
                number="04"
                title="Address"
                description="Contact location"
              >
                <Field label="Address">
                  <textarea
                    value={
                      editOM.profiles?.address || ""
                    }
                    onChange={(e) =>
                      setEditOM({
                        ...editOM,
                        profiles:
                          editOM.profiles
                            ? {
                              ...editOM.profiles,
                              address:
                                e.target.value,
                            }
                            : null,
                      })
                    }
                    className={`${inputClass} min-h-[90px] resize-none py-3`}
                  />
                </Field>
              </FormSection>

              <div
                className="
                  sticky bottom-0
                  -mx-5 -mb-5
                  border-t border-border
                  bg-background/95
                  p-4
                  backdrop-blur-xl

                  sm:-mx-7 sm:-mb-7 sm:p-5
                "
              >
                <button
                  type="submit"
                  disabled={isPending}
                  className="
                    flex h-12 w-full
                    items-center justify-center
                    gap-2
                    bg-accent-gold
                    text-[8px]
                    font-bold uppercase
                    tracking-[0.22em]
                    text-black

                    disabled:opacity-50
                  "
                >
                  {isPending
                    ? "Saving Changes..."
                    : "Save Profile Details"}
                </button>
              </div>
            </form>
          </ModalShell>,
          document.body
        )}
    </div>
  );
}

// ============================================================================
// MANAGER CARD
// ============================================================================

function ManagerCard({
  manager,
  index,
  onEdit,
  onPasswordReset,
  onStatusChange,
}: {
  manager: OMProfile;
  index: number;
  onEdit: () => void;
  onPasswordReset: () => void;
  onStatusChange: (
    status: OMProfile["employment_status"]
  ) => void;
}) {
  const profile = manager.profiles;

  const workload =
    Number(manager.current_workload) || 0;

  const workloadPercentage = Math.min(
    100,
    (workload / 5) * 100
  );

  const initials =
    profile?.full_name
      ?.split(" ")
      .map((item) => item[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "OM";

  const statusStyle =
    manager.employment_status === "Active"
      ? "border-emerald-500/20 bg-emerald-500/[0.07] text-emerald-500"
      : manager.employment_status ===
        "Suspended"
        ? "border-red-500/20 bg-red-500/[0.07] text-red-500"
        : manager.employment_status ===
          "Onboarding"
          ? "border-amber-500/20 bg-amber-500/[0.07] text-amber-500"
          : "border-border bg-foreground/[0.03] text-muted-foreground";

  return (
    <article
      className="
        group relative
        flex min-w-0 flex-col
        overflow-hidden
        border border-border
        bg-surface/55
        transition-all duration-500

        hover:border-accent-gold/30
        hover:shadow-[0_20px_55px_rgba(0,0,0,0.08)]
      "
    >
      {/* top accent */}

      <div
        className="
          absolute left-0 top-0
          h-[2px] w-0
          bg-accent-gold
          transition-all duration-700
          group-hover:w-full
        "
      />

      {/* HEADER */}

      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-4">

          {/* avatar */}

          <div
            className="
              relative flex h-12 w-12
              shrink-0 items-center justify-center
              overflow-hidden
              border border-accent-gold/20
              bg-accent-gold/[0.05]
            "
          >
            {manager.profile_photo ? (
              <img
                src={manager.profile_photo}
                alt={profile?.full_name || "Manager"}
                className="h-full w-full object-cover"
              />
            ) : (
              <span
                className="
                  text-base font-normal
                  text-accent-gold
                "
                style={{
                  fontFamily:
                    '"Playfair Display", serif',
                }}
              >
                {initials}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <span
                  className="
                    block text-[7px]
                    font-bold uppercase
                    tracking-[0.24em]
                    text-accent-gold
                  "
                >
                  {manager.employee_id}
                </span>

                <h3
                  className="
                    mt-1 truncate
                    text-xl font-normal
                    tracking-[-0.015em]
                    text-foreground
                  "
                  style={{
                    fontFamily:
                      '"Playfair Display", serif',
                  }}
                >
                  {profile?.full_name ||
                    "Unnamed Manager"}
                </h3>

                <span className="mt-1 block truncate text-[9px] text-muted-foreground">
                  {manager.designation}
                </span>
              </div>

              <span
                className={`
                  shrink-0
                  border
                  px-2 py-1
                  text-[6px]
                  font-bold uppercase
                  tracking-[0.18em]
                  ${statusStyle}
                `}
              >
                {manager.employment_status}
              </span>
            </div>
          </div>
        </div>

        {/* CONTACT */}

        <div
          className="
            mt-5 space-y-2.5
            border-t border-border/70
            pt-4
          "
        >
          <InfoRow
            icon={<Mail />}
            value={
              profile?.email ||
              "Email unavailable"
            }
          />

          <InfoRow
            icon={<Phone />}
            value={
              profile?.phone_number ||
              "Phone unavailable"
            }
          />

          <InfoRow
            icon={<MapPin />}
            value={
              manager.assigned_cities?.length
                ? manager.assigned_cities.join(
                  " · "
                )
                : profile?.address ||
                "No location assigned"
            }
          />
        </div>

        {/* COVERAGE */}

        <div className="mt-5">
          <span
            className="
              text-[7px] font-bold uppercase
              tracking-[0.22em]
              text-muted-foreground/60
            "
          >
            Operational Coverage
          </span>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {manager.assigned_regions?.length ? (
              manager.assigned_regions.map(
                (region) => (
                  <span
                    key={region}
                    className="
                      border border-border
                      bg-background/50
                      px-2 py-1
                      text-[7px]
                      font-semibold
                      text-muted-foreground
                    "
                  >
                    {region}
                  </span>
                )
              )
            ) : (
              <span className="text-[9px] italic text-muted-foreground/50">
                No regions assigned
              </span>
            )}
          </div>
        </div>

        {/* WORKLOAD */}

        <div
          className="
            mt-5
            border-y border-border/70
            py-4
          "
        >
          <div className="flex items-end justify-between gap-3">
            <div>
              <span
                className="
                  text-[7px] font-bold uppercase
                  tracking-[0.22em]
                  text-muted-foreground/60
                "
              >
                Active Workload
              </span>

              <div className="mt-1 flex items-baseline gap-1">
                <span
                  className="
                    text-2xl font-normal
                    text-foreground
                  "
                  style={{
                    fontFamily:
                      '"Playfair Display", serif',
                  }}
                >
                  {workload}
                </span>

                <span className="text-[8px] text-muted-foreground">
                  / 5 events
                </span>
              </div>
            </div>

            <span
              className={`
                text-[8px] font-bold uppercase
                tracking-[0.16em]

                ${workload >= 4
                  ? "text-red-500"
                  : workload >= 2
                    ? "text-amber-500"
                    : "text-emerald-500"
                }
              `}
            >
              {workload >= 4
                ? "High Load"
                : workload >= 2
                  ? "Moderate"
                  : "Capacity Open"}
            </span>
          </div>

          <div className="mt-3 flex gap-1">
            {Array.from({ length: 5 }).map(
              (_, item) => (
                <span
                  key={item}
                  className={`
                    h-1.5 flex-1
                    transition-colors

                    ${item < workload
                      ? workload >= 4
                        ? "bg-red-500"
                        : workload >= 2
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      : "bg-foreground/[0.07]"
                    }
                  `}
                />
              )
            )}
          </div>

          <span className="sr-only">
            Workload {workloadPercentage} percent
          </span>
        </div>

        {/* METRICS */}

        <div className="mt-4 grid grid-cols-3">
          <Metric
            icon={<Award />}
            label="Performance"
            value={`${manager.performance_score || 0}/5`}
          />

          <Metric
            icon={<Activity />}
            label="Completion"
            value={`${manager.completion_rate || 0}%`}
          />

          <Metric
            icon={<ShieldCheck />}
            label="Availability"
            value={
              manager.availability_status ||
              "Unknown"
            }
            highlight={
              manager.availability_status ===
              "Available"
            }
          />
        </div>
      </div>

      {/* ACTION BAR */}

      <div
        className="
          mt-auto
          grid grid-cols-3
          border-t border-border
          bg-background/30
        "
      >
        <CardAction
          icon={<Edit3 />}
          label="Edit"
          onClick={onEdit}
        />

        <CardAction
          icon={<KeyRound />}
          label="Reset"
          onClick={onPasswordReset}
        />

        {manager.employment_status ===
          "Active" ? (
          <CardAction
            icon={<UserX />}
            label="Suspend"
            danger
            onClick={() =>
              onStatusChange("Suspended")
            }
          />
        ) : (
          <CardAction
            icon={<UserCheck />}
            label="Activate"
            success
            onClick={() =>
              onStatusChange("Active")
            }
          />
        )}
      </div>
    </article>
  );
}

// ============================================================================
// SMALL COMPONENTS
// ============================================================================

function InfoRow({
  icon,
  value,
}: {
  icon: React.ReactElement;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span
        className="
          flex h-6 w-6 shrink-0
          items-center justify-center
          text-accent-gold
          [&>svg]:h-3
          [&>svg]:w-3
        "
      >
        {icon}
      </span>

      <span className="min-w-0 truncate text-[9px] text-muted-foreground">
        {value}
      </span>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ReactElement;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className="
        min-w-0
        border-r border-border/60
        px-2
        text-center
        last:border-r-0
        first:pl-0
        last:pr-0
      "
    >
      <div
        className="
          mb-1 flex items-center
          justify-center
          text-accent-gold
          [&>svg]:h-3
          [&>svg]:w-3
        "
      >
        {icon}
      </div>

      <span
        className="
          block truncate
          text-[6px]
          font-bold uppercase
          tracking-[0.16em]
          text-muted-foreground/55
        "
      >
        {label}
      </span>

      <span
        className={`
          mt-1 block truncate
          text-[9px] font-semibold

          ${highlight
            ? "text-emerald-500"
            : "text-foreground"
          }
        `}
      >
        {value}
      </span>
    </div>
  );
}

function CardAction({
  icon,
  label,
  onClick,
  danger = false,
  success = false,
}: {
  icon: React.ReactElement;
  label: string;
  onClick: () => void;
  danger?: boolean;
  success?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex min-w-0
        items-center justify-center
        gap-1.5
        border-r border-border
        px-2 py-3.5
        text-[7px]
        font-bold uppercase
        tracking-[0.12em]
        transition-all duration-300
        last:border-r-0

        ${danger
          ? "text-red-500 hover:bg-red-500/[0.06]"
          : success
            ? "text-emerald-500 hover:bg-emerald-500/[0.06]"
            : "text-muted-foreground hover:bg-accent-gold/[0.05] hover:text-accent-gold"
        }

        [&>svg]:h-3
        [&>svg]:w-3
      `}
    >
      {icon}

      <span className="truncate">
        {label}
      </span>
    </button>
  );
}

// ============================================================================
// MODAL
// ============================================================================

function ModalShell({
  title,
  eyebrow,
  description,
  onClose,
  children,
}: {
  title: string;
  eyebrow: string;
  description: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="
        fixed inset-0
        z-[9999]
        overflow-y-auto
        bg-black/65
        backdrop-blur-md
      "
    >
      <div
        className="
          flex min-h-full
          items-start justify-center
          p-3 py-5

          sm:p-6 sm:py-8
        "
      >
        <div
          className="
            relative
            w-full max-w-2xl
            overflow-hidden
            border border-border
            bg-background
            shadow-[0_35px_100px_rgba(0,0,0,0.45)]
          "
        >
          {/* gold top line */}

          <div className="absolute left-0 top-0 h-[2px] w-full bg-gradient-to-r from-transparent via-accent-gold to-transparent" />

          {/* header */}

          <div
            className="
              flex items-start
              justify-between gap-5
              border-b border-border
              p-5

              sm:p-7
            "
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <span className="h-px w-6 bg-accent-gold" />

                <span
                  className="
                    truncate
                    text-[7px]
                    font-bold uppercase
                    tracking-[0.26em]
                    text-accent-gold
                  "
                >
                  {eyebrow}
                </span>
              </div>

              <h2
                className="
                  mt-3
                  text-2xl sm:text-3xl
                  font-normal
                  tracking-[-0.025em]
                  text-foreground
                "
                style={{
                  fontFamily:
                    '"Playfair Display", serif',
                }}
              >
                {title}
              </h2>

              <p
                className="
                  mt-2 max-w-lg
                  text-[9px] sm:text-[10px]
                  leading-5
                  text-muted-foreground
                "
              >
                {description}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="
                flex h-9 w-9 shrink-0
                items-center justify-center
                border border-border
                text-muted-foreground
                transition-all duration-300

                hover:border-accent-gold/40
                hover:text-accent-gold
              "
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-5 sm:p-7">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function FormSection({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div
        className="
          mb-4 flex items-end
          justify-between gap-4
          border-b border-border/70
          pb-3
        "
      >
        <div className="flex items-center gap-3">
          <span
            className="
              text-xl font-normal
              text-accent-gold/35
            "
            style={{
              fontFamily:
                '"Playfair Display", serif',
            }}
          >
            {number}
          </span>

          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-foreground">
              {title}
            </h3>

            <p className="mt-0.5 text-[8px] text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {children}
      </div>
    </section>
  );
}

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span
        className="
          text-[7px]
          font-bold uppercase
          tracking-[0.2em]
          text-muted-foreground
        "
      >
        {label}

        {required && (
          <span className="ml-1 text-accent-gold">
            *
          </span>
        )}
      </span>

      {children}
    </label>
  );
}

function SelectionGroup({
  label,
  options,
  selected,
  toggle,
}: {
  label: string;
  options: string[];
  selected: string[];
  toggle: (value: string) => void;
}) {
  return (
    <div>
      <span
        className="
          text-[7px]
          font-bold uppercase
          tracking-[0.2em]
          text-muted-foreground
        "
      >
        {label}
      </span>

      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => {
          const active =
            selected.includes(option);

          return (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              className={`
                flex items-center gap-1.5
                border
                px-3 py-2
                text-[8px]
                font-semibold
                transition-all duration-300

                ${active
                  ? "border-accent-gold bg-accent-gold text-black"
                  : "border-border bg-background text-muted-foreground hover:border-accent-gold/30 hover:text-foreground"
                }
              `}
            >
              {active && (
                <Check className="h-3 w-3" />
              )}

              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function EmptyState({
  hasManagers,
  clearFilters,
  addManager,
}: {
  hasManagers: boolean;
  clearFilters: () => void;
  addManager: () => void;
}) {
  return (
    <div
      className="
        flex min-h-[320px]
        flex-col items-center
        justify-center
        border border-dashed
        border-border
        bg-surface/25
        px-6 py-16
        text-center
      "
    >
      <div
        className="
          flex h-14 w-14
          items-center justify-center
          border border-accent-gold/20
          bg-accent-gold/[0.04]
          text-accent-gold
        "
      >
        {hasManagers ? (
          <Filter className="h-5 w-5" />
        ) : (
          <Users className="h-5 w-5" />
        )}
      </div>

      <span
        className="
          mt-5 text-[7px]
          font-bold uppercase
          tracking-[0.26em]
          text-accent-gold
        "
      >
        Operations Registry
      </span>

      <h3
        className="
          mt-2 text-2xl
          font-normal
          text-foreground
        "
        style={{
          fontFamily:
            '"Playfair Display", serif',
        }}
      >
        {hasManagers
          ? "No matching managers."
          : "Build your operations team."}
      </h3>

      <p className="mt-2 max-w-sm text-[10px] leading-5 text-muted-foreground">
        {hasManagers
          ? "No operational managers match the current search or filters."
          : "No Operational Managers have been registered yet."}
      </p>

      <button
        type="button"
        onClick={
          hasManagers
            ? clearFilters
            : addManager
        }
        className="
          mt-6
          bg-accent-gold
          px-5 py-2.5
          text-[7px]
          font-bold uppercase
          tracking-[0.2em]
          text-black
        "
      >
        {hasManagers
          ? "Clear Filters"
          : "Onboard First Manager"}
      </button>
    </div>
  );
}

const inputClass = `
  h-11
  w-full
  border
  border-border
  bg-background
  px-3
  text-[10px]
  text-foreground
  outline-none
  transition-all
  duration-300
  placeholder:text-muted-foreground/40

  focus:border-accent-gold/50
  focus:ring-2
  focus:ring-accent-gold/[0.06]
`;