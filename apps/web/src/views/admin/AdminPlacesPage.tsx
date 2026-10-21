"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AdminCollection, AdminDraftGuard, AdminRecord, confirmAdminDiscard } from "@/components/admin/AdminCollection";
import { AdminOrderEditor } from "@/components/admin/AdminOrderEditor";

import {
  createLocationType,
  createPlace,
  deleteLocationType,
  deletePlace,
  geocodeAddress,
  getLocationTypes,
  getPlaces,
  updateLocationType,
  updatePlace,
} from "../../api/client";
import {
  PLACE_ICON_OPTIONS,
  PlaceIcon,
} from "../../lib/place-icons";
import type {
  LocationType,
  Place,
  PlaceIconName,
} from "../../types/article";

type PlaceForm = {
  name: string;
  typeId: string;
  address: string;
  latitude: string;
  longitude: string;
  isVisible: boolean;
};

type LocationTypeForm = {
  name: string;
  icon: PlaceIconName;
  navigationOrder: string;
  isVisible: boolean;
};

function emptyPlaceForm(typeId = ""): PlaceForm {
  return {
    name: "",
    typeId,
    address: "",
    latitude: "",
    longitude: "",
    isVisible: true,
  };
}

const emptyLocationTypeForm: LocationTypeForm = {
  name: "",
  icon: "coffee",
  navigationOrder: "1",
  isVisible: true,
};

function placeToForm(place: Place): PlaceForm {
  return {
    name: place.name,
    typeId: place.typeId,
    address: place.address,
    latitude: String(place.latitude),
    longitude: String(place.longitude),
    isVisible: place.isVisible,
  };
}

function typeToForm(locationType: LocationType): LocationTypeForm {
  return {
    name: locationType.name,
    icon: locationType.icon,
    navigationOrder: String(locationType.navigationOrder),
    isVisible: locationType.isVisible,
  };
}

function parseCoordinate(value: string) {
  return Number(value.trim().replace(",", "."));
}

function validatePlace(form: PlaceForm) {
  const latitude = parseCoordinate(form.latitude);
  const longitude = parseCoordinate(form.longitude);

  if (form.name.trim().length < 2) {
    return "Назва має містити щонайменше 2 символи.";
  }

  if (!form.typeId) {
    return "Оберіть тип місця.";
  }

  if (form.address.trim().length < 3) {
    return "Вкажіть адресу.";
  }

  if (
    !Number.isFinite(latitude) ||
    form.latitude.trim() === "" ||
    latitude < -90 ||
    latitude > 90
  ) {
    return "Знайдіть адресу або введіть коректну широту.";
  }

  if (
    !Number.isFinite(longitude) ||
    form.longitude.trim() === "" ||
    longitude < -180 ||
    longitude > 180
  ) {
    return "Знайдіть адресу або введіть коректну довготу.";
  }

  return null;
}

function validateLocationType(form: LocationTypeForm) {
  const order = Number(form.navigationOrder);

  if (form.name.trim().length < 2) {
    return "Назва типу має містити щонайменше 2 символи.";
  }

  if (!Number.isInteger(order) || order < 0 || order > 999) {
    return "Порядок має бути цілим числом від 0 до 999.";
  }

  return null;
}

function IconPicker({
  value,
  onChange,
}: {
  value: PlaceIconName;
  onChange: (value: PlaceIconName) => void;
}) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const [query, setQuery] = useState("");
  const selectedOption =
    PLACE_ICON_OPTIONS.find((option) => option.value === value) ??
    PLACE_ICON_OPTIONS[PLACE_ICON_OPTIONS.length - 1];
  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("uk");

    if (!normalizedQuery) {
      return PLACE_ICON_OPTIONS;
    }

    return PLACE_ICON_OPTIONS.filter((option) =>
      `${option.label} ${option.keywords} ${option.value}`
        .toLocaleLowerCase("uk")
        .includes(normalizedQuery),
    );
  }, [query]);

  return (
    <details className="places-icon-picker" ref={detailsRef}>
      <summary>
        <span className="places-icon-picker__selected-icon">
          <PlaceIcon name={selectedOption.value} />
        </span>
        <span>
          <small>Іконка</small>
          <strong>{selectedOption.label}</strong>
        </span>
        <span className="places-icon-picker__chevron" aria-hidden="true">
          ↓
        </span>
      </summary>

      <div className="places-icon-picker__panel">
        <label className="places-icon-picker__search">
          <span>Пошук іконки</span>
          <input
            type="search"
            value={query}
            placeholder="Кава, театр, парк…"
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        <div
          className="places-icon-picker__grid"
          role="radiogroup"
          aria-label="Іконка типу локації"
        >
          {filteredOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={value === option.value}
              className={value === option.value ? "is-active" : ""}
              onClick={() => {
                onChange(option.value);
                setQuery("");
                detailsRef.current?.removeAttribute("open");
              }}
            >
              <PlaceIcon name={option.value} />
              <span>{option.label}</span>
            </button>
          ))}
        </div>

        {filteredOptions.length === 0 && (
          <p className="places-icon-picker__empty">Іконок не знайдено.</p>
        )}
      </div>
    </details>
  );
}

function AddressField({
  form,
  onChange,
  onError,
}: {
  form: PlaceForm;
  onChange: (next: PlaceForm) => void;
  onError: (message: string | null) => void;
}) {
  const [resolving, setResolving] = useState(false);

  async function resolveAddress() {
    if (form.address.trim().length < 3) {
      onError("Введіть адресу перед пошуком.");
      return;
    }

    try {
      setResolving(true);
      onError(null);
      const result = await geocodeAddress(form.address.trim());

      onChange({
        ...form,
        address: result.address,
        latitude: String(result.latitude),
        longitude: String(result.longitude),
      });
    } catch (error) {
      onError(
        error instanceof Error ? error.message : "Не вдалося знайти адресу.",
      );
    } finally {
      setResolving(false);
    }
  }

  const hasPosition =
    form.latitude.trim() !== "" &&
    form.longitude.trim() !== "" &&
    Number.isFinite(parseCoordinate(form.latitude)) &&
    Number.isFinite(parseCoordinate(form.longitude));

  return (
    <div className="places-address-field">
      <label>
        <span>Адреса</span>
        <div className="places-address-field__control">
          <input
            value={form.address}
            maxLength={240}
            placeholder="Наприклад, Burggasse 10, 1070 Wien"
            onChange={(event) =>
              onChange({
                ...form,
                address: event.target.value,
                latitude: "",
                longitude: "",
              })
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void resolveAddress();
              }
            }}
          />
          <button
            type="button"
            disabled={resolving || form.address.trim().length < 3}
            onClick={() => void resolveAddress()}
          >
            {resolving ? "Шукаємо…" : "Знайти адресу"}
          </button>
        </div>
      </label>

      {hasPosition && (
        <p className="places-address-field__success">
          <span aria-hidden="true">✓</span>
          Точку на карті визначено
        </p>
      )}

      <details className="places-coordinates">
        <summary>Точні координати</summary>
        <div>
          <label>
            <span>Широта</span>
            <input
              value={form.latitude}
              inputMode="decimal"
              placeholder="48.2082"
              onChange={(event) =>
                onChange({
                  ...form,
                  latitude: event.target.value,
                })
              }
            />
          </label>
          <label>
            <span>Довгота</span>
            <input
              value={form.longitude}
              inputMode="decimal"
              placeholder="16.3738"
              onChange={(event) =>
                onChange({
                  ...form,
                  longitude: event.target.value,
                })
              }
            />
          </label>
        </div>
      </details>
    </div>
  );
}

function PlaceFields({
  form,
  locationTypes,
  onChange,
  onError,
}: {
  form: PlaceForm;
  locationTypes: LocationType[];
  onChange: (next: PlaceForm) => void;
  onError: (message: string | null) => void;
}) {
  return (
    <div className="places-admin-fields">
      <label>
        <span>Назва</span>
        <input
          value={form.name}
          maxLength={160}
          placeholder="Назва закладу або місця"
          onChange={(event) => onChange({ ...form, name: event.target.value })}
        />
      </label>

      <label>
        <span>Тип</span>
        <select
          value={form.typeId}
          onChange={(event) =>
            onChange({ ...form, typeId: event.target.value })
          }
        >
          <option value="">Оберіть тип</option>
          {locationTypes.map((locationType) => (
            <option key={locationType.id} value={locationType.id}>
              {locationType.name}
            </option>
          ))}
        </select>
      </label>

      <AddressField form={form} onChange={onChange} onError={onError} />

      <label className="places-admin-visible">
        <input
          type="checkbox"
          checked={form.isVisible}
          onChange={(event) =>
            onChange({ ...form, isVisible: event.target.checked })
          }
        />
        <span>Показувати на публічній карті</span>
      </label>
    </div>
  );
}

function EditableLocationType({
  locationType,
  busy,
  onSave,
  onDelete,
}: {
  locationType: LocationType;
  busy: boolean;
  onSave: (id: string, form: LocationTypeForm) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [form, setForm] = useState(() => typeToForm(locationType));
  const usageCount = locationType._count?.places ?? 0;
  const unchanged =
    JSON.stringify(form) === JSON.stringify(typeToForm(locationType));

  return (
    <AdminRecord title={locationType.name} meta={`${usageCount} місць · ${locationType.isVisible ? "У фільтрах" : "Прихований тип"}`} icon={<PlaceIcon name={locationType.icon} />} dirty={!unchanged}>
    <article className="places-type-card">
      <div className="places-type-card__header">
        <span className="places-type-card__icon">
          <PlaceIcon name={form.icon} />
        </span>
        <div>
          <strong>{locationType.name}</strong>
          <code>{locationType.slug}</code>
        </div>
        <span>{usageCount} місць</span>
      </div>

      <div className="places-type-card__fields">
        <label>
          <span>Назва</span>
          <input
            value={form.name}
            maxLength={80}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
        </label>
      </div>

      <IconPicker
        value={form.icon}
        onChange={(icon) => setForm({ ...form, icon })}
      />

      <div className="places-type-card__actions">
        <label className="places-admin-visible">
          <input
            type="checkbox"
            checked={form.isVisible}
            onChange={(event) =>
              setForm({ ...form, isVisible: event.target.checked })
            }
          />
          <span>Показувати у фільтрах</span>
        </label>
        <button
          className="content-admin-button"
          type="button"
          disabled={busy || unchanged || Boolean(validateLocationType(form))}
          onClick={() =>
            void onSave(locationType.id, form).catch(() => undefined)
          }
        >
          Зберегти
        </button>
        <button
          className="content-admin-button content-admin-button--danger"
          type="button"
          disabled={busy || usageCount > 0}
          title={usageCount > 0 ? "Спочатку змініть тип у всіх місць" : undefined}
          onClick={() => {
            if (window.confirm(`Видалити тип «${locationType.name}»?`)) {
              void onDelete(locationType.id).catch(() => undefined);
            }
          }}
        >
          Видалити
        </button>
      </div>
    </article>
    </AdminRecord>
  );
}

function EditablePlace({
  place,
  locationTypes,
  busy,
  onError,
  onSave,
  onDelete,
}: {
  place: Place;
  locationTypes: LocationType[];
  busy: boolean;
  onError: (message: string | null) => void;
  onSave: (id: string, form: PlaceForm) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [form, setForm] = useState(() => placeToForm(place));
  const usageCount = place._count?.articles ?? 0;
  const unchanged = JSON.stringify(form) === JSON.stringify(placeToForm(place));

  return (
    <AdminRecord title={place.name} meta={`${place.address} · ${place.isVisible ? "Видиме" : "Приховане"} · Статей: ${usageCount}`} icon={<PlaceIcon name={place.type.icon} />} dirty={!unchanged}>
    <article className="places-admin-card">
      <div className="places-admin-card__heading">
        <span className="places-admin-card__icon">
          <PlaceIcon name={place.type.icon} />
        </span>
        <div>
          <strong>{place.name}</strong>
          <span>{place.address}</span>
        </div>
        <div className="places-admin-card__meta">
          <code>{place.slug}</code>
          <span>{usageCount} прив’язаних статей</span>
        </div>
      </div>

      <PlaceFields
        form={form}
        locationTypes={locationTypes}
        onChange={setForm}
        onError={onError}
      />

      <div className="places-admin-card__actions">
        <button
          className="content-admin-button"
          type="button"
          disabled={busy || unchanged || Boolean(validatePlace(form))}
          onClick={() => void onSave(place.id, form).catch(() => undefined)}
        >
          Зберегти
        </button>
        <button
          className="content-admin-button content-admin-button--danger"
          type="button"
          disabled={busy || usageCount > 0}
          title={
            usageCount > 0
              ? "Спочатку відв’яжіть місце від усіх статей"
              : undefined
          }
          onClick={() => {
            if (window.confirm(`Видалити місце «${place.name}»?`)) {
              void onDelete(place.id).catch(() => undefined);
            }
          }}
        >
          Видалити
        </button>
      </div>
    </article>
    </AdminRecord>
  );
}

export function AdminPlacesPage() {
  const [tab, setTab] = useState("places");
  const [message, setMessage] = useState<string | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [locationTypes, setLocationTypes] = useState<LocationType[]>([]);
  const [newPlace, setNewPlace] = useState<PlaceForm>(() => emptyPlaceForm());
  const [newType, setNewType] = useState<LocationTypeForm>(
    emptyLocationTypeForm,
  );
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refreshData() {
    const [placesData, typesData] = await Promise.all([
      getPlaces(),
      getLocationTypes(),
    ]);

    setPlaces(placesData);
    setLocationTypes(typesData);
  }

  useEffect(() => {
    let cancelled = false;

    Promise.all([getPlaces(), getLocationTypes()])
      .then(([placesData, typesData]) => {
        if (!cancelled) {
          setPlaces(placesData);
          setLocationTypes(typesData);
          setNewPlace(emptyPlaceForm(typesData[0]?.id ?? ""));
          setNewType({
            ...emptyLocationTypeForm,
            navigationOrder: String(typesData.length + 1),
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Не вдалося завантажити місця та їхні типи.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function runMutation(action: () => Promise<unknown>) {
    try {
      setBusy(true);
      setError(null);
      setMessage(null);
      await action();
      await refreshData();
      setMessage("Зміни збережено.");
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Не вдалося зберегти зміни.",
      );
      throw mutationError;
    } finally {
      setBusy(false);
    }
  }

  async function savePlace(id: string, form: PlaceForm) {
    const validationError = validatePlace(form);

    if (validationError) {
      setError(validationError);
      return;
    }

    await runMutation(() =>
      updatePlace(id, {
        name: form.name.trim(),
        typeId: form.typeId,
        address: form.address.trim(),
        latitude: parseCoordinate(form.latitude),
        longitude: parseCoordinate(form.longitude),
        isVisible: form.isVisible,
      }),
    );
  }

  async function saveLocationType(id: string, form: LocationTypeForm) {
    const validationError = validateLocationType(form);

    if (validationError) {
      setError(validationError);
      return;
    }

    await runMutation(() =>
      updateLocationType(id, {
        name: form.name.trim(),
        icon: form.icon,
        isVisible: form.isVisible,
      }),
    );
  }

  if (loading) {
    return <main className="places-admin-shell">Завантажуємо місця…</main>;
  }

  return (
    <main className="places-admin-shell">
      <AdminDraftGuard />
      <header className="content-admin-header">
        <div>
          <span>КАРТА</span>
          <h1>Місця</h1>
          <p>Адреси, маркери та матеріали для редакційної карти.</p>
        </div>
      </header>

      {error && (
        <div className="content-admin-error" role="alert">
          {error}
        </div>
      )}

      {message && <p className="save-message" role="status">{message}</p>}
      <nav className="admin-collection-tabs" aria-label="Керування місцями">
        {[["places", "Збережені місця", places.length], ["new", "Нове місце", null], ["types", "Типи локацій", locationTypes.length]].map(([value, label, count]) => (
          <button key={value} className="admin-button" type="button" disabled={busy} aria-pressed={tab === value}
            onClick={() => { if (value !== tab && confirmAdminDiscard()) { setTab(String(value)); setNewPlace(emptyPlaceForm(locationTypes[0]?.id ?? "")); setNewType(emptyLocationTypeForm); } }}>
            {label}{count !== null ? ` · ${count}` : ""}
          </button>
        ))}
      </nav>
      {tab === "types" && <section className="content-admin-section places-types-section">
        <div className="content-admin-section__heading">
          <div>
            <h2>Типи локацій</h2>
            <p>Тип визначає фільтр та іконку маркера на публічній карті.</p>
          </div>
        </div>

        <AdminOrderEditor externalBusy={busy} items={locationTypes} resource="location-types" onSaved={refreshData} label="Порядок фільтрів карти" />
        <AdminCollection busy={busy} items={locationTypes} label="Типи локацій" pageSize={6} expandable renderItem={locationType => (
          <EditableLocationType key={JSON.stringify(locationType)} locationType={locationType} busy={busy}
            onSave={saveLocationType} onDelete={id => runMutation(() => deleteLocationType(id)).then(() => undefined)} />
        )} />

        <div className="places-type-create" data-admin-dirty={newType.name || newType.icon !== "coffee" ? "true" : undefined} data-editor-dirty={newType.name || newType.icon !== "coffee" ? "true" : undefined}>
          <div className="places-type-create__fields">
            <label>
              <span>Новий тип</span>
              <input
                value={newType.name}
                maxLength={80}
                placeholder="Наприклад, Галереї"
                onChange={(event) =>
                  setNewType({ ...newType, name: event.target.value })
                }
              />
            </label>
          </div>
          <IconPicker
            value={newType.icon}
            onChange={(icon) => setNewType({ ...newType, icon })}
          />
          <button
            className="content-admin-button content-admin-button--primary"
            type="button"
            disabled={busy || Boolean(validateLocationType(newType))}
            onClick={() => {
              const validationError = validateLocationType(newType);

              if (validationError) {
                setError(validationError);
                return;
              }

              void runMutation(() =>
                createLocationType({
                  name: newType.name.trim(),
                  icon: newType.icon,
                  navigationOrder: Math.min(999, Math.max(0, ...locationTypes.map(type => type.navigationOrder)) + 1),
                  isVisible: true,
                }),
              )
                .then(() =>
                  setNewType({
                    ...emptyLocationTypeForm,
                    navigationOrder: String(locationTypes.length + 2),
                  }),
                )
                .catch(() => undefined);
            }}
          >
            Додати тип
          </button>
        </div>
      </section>}

      {tab === "new" && <section className="content-admin-section places-admin-create" data-admin-dirty={JSON.stringify(newPlace) !== JSON.stringify(emptyPlaceForm(locationTypes[0]?.id ?? "")) ? "true" : undefined} data-editor-dirty={JSON.stringify(newPlace) !== JSON.stringify(emptyPlaceForm(locationTypes[0]?.id ?? "")) ? "true" : undefined}>
        <div className="content-admin-section__heading">
          <div>
            <h2>Нове місце</h2>
            <p>Введіть адресу — координати для карти заповняться автоматично.</p>
          </div>
        </div>

        <PlaceFields
          form={newPlace}
          locationTypes={locationTypes}
          onChange={setNewPlace}
          onError={setError}
        />

        <button
          className="content-admin-button content-admin-button--primary"
          type="button"
          disabled={busy || Boolean(validatePlace(newPlace))}
          onClick={() => {
            const validationError = validatePlace(newPlace);

            if (validationError) {
              setError(validationError);
              return;
            }

            void runMutation(() =>
              createPlace({
                name: newPlace.name.trim(),
                typeId: newPlace.typeId,
                address: newPlace.address.trim(),
                latitude: parseCoordinate(newPlace.latitude),
                longitude: parseCoordinate(newPlace.longitude),
                isVisible: newPlace.isVisible,
              }),
            )
              .then(() =>
                setNewPlace(emptyPlaceForm(locationTypes[0]?.id ?? "")),
              )
              .catch(() => undefined);
          }}
        >
          Додати місце
        </button>
      </section>}

      {tab === "places" && <section className="places-admin-list" aria-label="Збережені місця">
        <div className="places-admin-list__heading">
          <h2>Збережені місця</h2>
          <span>{places.length}</span>
        </div>

        <AdminCollection busy={busy} items={places} label="Місця" searchText={place => `${place.name} ${place.slug} ${place.address} ${place.type.name}`}
          renderItem={place => <EditablePlace key={JSON.stringify(place)} place={place} locationTypes={locationTypes}
            busy={busy} onError={setError} onSave={savePlace}
            onDelete={id => runMutation(() => deletePlace(id)).then(() => undefined)} />} />
      </section>}
    </main>
  );
}
