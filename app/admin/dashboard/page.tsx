'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import BulkImport from '@/app/components/BulkImport';

type ContentType = 'playlists' | 'xtream' | 'mac-portal' | 'apps';

type FormField = {
  label: string;
  name: string;
  placeholder: string;
  required?: boolean;
  type?: 'text' | 'textarea' | 'url' | 'password' | 'date' | 'checkbox';
};

type FormDataState = Record<string, string | boolean>;

type DashboardItem = {
  _id: string;
  category?: string;
  content?: string;
  createdAt?: string;
  description?: string;
  downloadUrl?: string;
  expirationDate?: string;
  fileSize?: string;
  icon?: string;
  isActive?: boolean;
  logo?: string;
  macAddress?: string;
  macIdentifier?: string;
  name?: string;
  password?: string;
  portalUrl?: string;
  serverUrl?: string;
  title?: string;
  username?: string;
  version?: string;
};

const TAB_ORDER: ContentType[] = ['playlists', 'xtream', 'mac-portal', 'apps'];

const TAB_CONFIG: Record<
  ContentType,
  {
    deleteSuccess: string;
    emptyLabel: string;
    fields: FormField[];
    heading: string;
    submitLabel: string;
    submitSuccess: string;
    tabLabel: string;
    updateLabel: string;
    updateSuccess: string;
  }
> = {
  playlists: {
    deleteSuccess: 'La playlist a ete supprimee.',
    emptyLabel: 'Aucune playlist pour le moment.',
    fields: [
      {
        name: 'title',
        label: 'Titre',
        placeholder: 'Ex: Bouquet Sport Premium',
        required: true,
      },
      {
        name: 'category',
        label: 'Categorie',
        placeholder: 'Ex: Sport',
      },
      {
        name: 'description',
        label: 'Description',
        placeholder: 'Decrivez le contenu de cette playlist',
        type: 'textarea',
      },
      {
        name: 'logo',
        label: 'Logo',
        placeholder: 'https://...',
        type: 'url',
      },
      {
        name: 'content',
        label: 'Contenu M3U',
        placeholder: '#EXTM3U ...',
        required: true,
        type: 'textarea',
      },
      {
        name: 'isActive',
        label: 'Visible sur le site',
        placeholder: '',
        type: 'checkbox',
      },
    ],
    heading: 'Gerer les playlists M3U',
    submitLabel: 'Ajouter la playlist',
    submitSuccess: 'La playlist a bien ete ajoutee.',
    tabLabel: 'M3U',
    updateLabel: 'Enregistrer les modifications',
    updateSuccess: 'La playlist a bien ete mise a jour.',
  },
  xtream: {
    deleteSuccess: "L'acces Xtream a ete supprime.",
    emptyLabel: 'Aucun acces Xtream pour le moment.',
    fields: [
      {
        name: 'title',
        label: 'Titre',
        placeholder: 'Ex: Abonnement famille',
        required: true,
      },
      {
        name: 'category',
        label: 'Categorie',
        placeholder: 'Ex: IPTV',
      },
      {
        name: 'description',
        label: 'Description',
        placeholder: 'Details utiles pour cet acces',
        type: 'textarea',
      },
      {
        name: 'serverUrl',
        label: 'URL du serveur',
        placeholder: 'https://serveur.com',
        required: true,
        type: 'url',
      },
      {
        name: 'username',
        label: "Nom d'utilisateur",
        placeholder: 'Identifiant',
        required: true,
      },
      {
        name: 'password',
        label: 'Mot de passe',
        placeholder: 'Mot de passe',
        required: true,
        type: 'password',
      },
      {
        name: 'expirationDate',
        label: "Date d'expiration",
        placeholder: '',
        type: 'date',
      },
      {
        name: 'isActive',
        label: 'Visible sur le site',
        placeholder: '',
        type: 'checkbox',
      },
    ],
    heading: 'Gerer les acces Xtream',
    submitLabel: "Ajouter l'acces Xtream",
    submitSuccess: "L'acces Xtream a bien ete ajoute.",
    tabLabel: 'Xtream',
    updateLabel: 'Mettre a jour cet acces',
    updateSuccess: "L'acces Xtream a bien ete mis a jour.",
  },
  'mac-portal': {
    deleteSuccess: 'Le portail Mac a ete supprime.',
    emptyLabel: 'Aucun portail Mac pour le moment.',
    fields: [
      {
        name: 'title',
        label: 'Titre',
        placeholder: 'Ex: Portail international',
        required: true,
      },
      {
        name: 'category',
        label: 'Categorie',
        placeholder: 'Ex: IPTV',
      },
      {
        name: 'description',
        label: 'Description',
        placeholder: 'Informations sur le portail',
        type: 'textarea',
      },
      {
        name: 'portalUrl',
        label: 'URL du portail',
        placeholder: 'https://portal.example.com/c',
        required: true,
        type: 'url',
      },
      {
        name: 'macAddress',
        label: 'Adresse MAC',
        placeholder: 'Ex: AA:BB:CC:DD:EE:FF',
      },
      {
        name: 'macIdentifier',
        label: 'Identifiant MAC',
        placeholder: 'Ex: MAC001',
      },
      {
        name: 'logo',
        label: 'Logo',
        placeholder: 'https://...',
        type: 'url',
      },
      {
        name: 'isActive',
        label: 'Visible sur le site',
        placeholder: '',
        type: 'checkbox',
      },
    ],
    heading: 'Gerer les portails Mac',
    submitLabel: 'Ajouter le portail',
    submitSuccess: 'Le portail Mac a bien ete ajoute.',
    tabLabel: 'Mac Portal',
    updateLabel: 'Mettre a jour ce portail',
    updateSuccess: 'Le portail Mac a bien ete mis a jour.',
  },
  apps: {
    deleteSuccess: "L'application a ete supprimee.",
    emptyLabel: 'Aucune application pour le moment.',
    fields: [
      {
        name: 'name',
        label: 'Nom',
        placeholder: 'Ex: IPTV Player Pro',
        required: true,
      },
      {
        name: 'version',
        label: 'Version',
        placeholder: '1.0.0',
      },
      {
        name: 'description',
        label: 'Description',
        placeholder: "Expliquez ce que fait l'application",
        type: 'textarea',
      },
      {
        name: 'downloadUrl',
        label: 'Lien de telechargement',
        placeholder: 'https://...',
        required: true,
        type: 'url',
      },
      {
        name: 'fileSize',
        label: 'Taille du fichier',
        placeholder: 'Ex: 48 MB',
      },
      {
        name: 'icon',
        label: 'Icone',
        placeholder: 'https://...',
        type: 'url',
      },
      {
        name: 'category',
        label: 'Categorie',
        placeholder: 'Ex: Lecteur',
      },
      {
        name: 'isActive',
        label: 'Visible sur le site',
        placeholder: '',
        type: 'checkbox',
      },
    ],
    heading: 'Gerer les applications',
    submitLabel: "Ajouter l'application",
    submitSuccess: "L'application a bien ete ajoutee.",
    tabLabel: 'Applications',
    updateLabel: 'Mettre a jour cette application',
    updateSuccess: "L'application a bien ete mise a jour.",
  },
};

const INITIAL_FORMS: Record<ContentType, FormDataState> = {
  playlists: {
    category: '',
    content: '',
    description: '',
    isActive: true,
    logo: '',
    title: '',
  },
  xtream: {
    category: '',
    description: '',
    expirationDate: '',
    isActive: true,
    password: '',
    serverUrl: '',
    title: '',
    username: '',
  },
  'mac-portal': {
    category: '',
    description: '',
    isActive: true,
    logo: '',
    macAddress: '',
    macIdentifier: '',
    portalUrl: '',
    title: '',
  },
  apps: {
    category: '',
    description: '',
    downloadUrl: '',
    fileSize: '',
    icon: '',
    isActive: true,
    name: '',
    version: '1.0.0',
  },
};

function getInitialFormData(type: ContentType): FormDataState {
  return { ...INITIAL_FORMS[type] };
}

function getEndpoint(type: ContentType, id?: string) {
  return `/api/admin/${type}${id ? `/${id}` : ''}`;
}

function getDateInputValue(value?: string) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString().slice(0, 10);
}

function getFormDataFromItem(type: ContentType, item: DashboardItem): FormDataState {
  const initialForm = getInitialFormData(type);

  return {
    ...initialForm,
    ...item,
    expirationDate: type === 'xtream' ? getDateInputValue(item.expirationDate) : '',
    isActive: item.isActive ?? true,
  };
}

function getFilteredPayload(formData: FormDataState) {
  return Object.fromEntries(
    Object.entries(formData).filter(([, value]) => value !== '')
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<ContentType>('playlists');
  const [bulkMode, setBulkMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ error: string; success: string }>({
    error: '',
    success: '',
  });
  const [formData, setFormData] = useState<FormDataState>(getInitialFormData('playlists'));
  const [items, setItems] = useState<DashboardItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [visibilityLoadingId, setVisibilityLoadingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setEditingId(null);
    setFormData(getInitialFormData(activeTab));
    setFeedback({ error: '', success: '' });
    setBulkMode(false);
  }, [activeTab]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadItems() {
      setLoading(true);

      try {
        const response = await fetch(getEndpoint(activeTab), {
          signal: controller.signal,
        });

        if (response.status === 401) {
          router.push('/admin/login');
          return;
        }

        if (!response.ok) {
          throw new Error('Impossible de charger les donnees.');
        }

        const data = (await response.json()) as DashboardItem[];
        setItems(data);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        console.error('Erreur lors du chargement:', error);
        setFeedback({
          error: 'Le chargement a echoue. Rechargez la page puis reessayez.',
          success: '',
        });
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadItems();

    return () => controller.abort();
  }, [activeTab, router]);

  const config = TAB_CONFIG[activeTab];

  const filteredItems = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase();

    if (!normalizedQuery) {
      return items;
    }

    return items.filter((item) => {
      const haystack = [
        item.title,
        item.name,
        item.description,
        item.category,
        item.serverUrl,
        item.portalUrl,
        item.downloadUrl,
        item.username,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [items, searchTerm]);

  const handleFieldChange = (name: string, value: string | boolean) => {
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData(getInitialFormData(activeTab));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedback({ error: '', success: '' });

    try {
      const payload = getFilteredPayload(formData);
      const response = await fetch(getEndpoint(activeTab, editingId ?? undefined), {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        router.push('/admin/login');
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "L'enregistrement a echoue.");
      }

      if (editingId) {
        setItems((current) =>
          current.map((item) => (item._id === editingId ? (data as DashboardItem) : item))
        );
      } else {
        setItems((current) => [data as DashboardItem, ...current]);
      }

      resetForm();
      setFeedback({
        error: '',
        success: editingId ? config.updateSuccess : config.submitSuccess,
      });
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      setFeedback({
        error:
          error instanceof Error
            ? error.message
            : "L'enregistrement a echoue. Merci de reessayer.",
        success: '',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: DashboardItem) => {
    setEditingId(item._id);
    setFormData(getFormDataFromItem(activeTab, item));
    setFeedback({ error: '', success: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cet element ?')) {
      return;
    }

    setFeedback({ error: '', success: '' });

    try {
      const response = await fetch(getEndpoint(activeTab, id), {
        method: 'DELETE',
      });

      if (response.status === 401) {
        router.push('/admin/login');
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || 'La suppression a echoue.');
      }

      setItems((current) => current.filter((item) => item._id !== id));

      if (editingId === id) {
        resetForm();
      }

      setFeedback({ error: '', success: config.deleteSuccess });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setFeedback({
        error:
          error instanceof Error
            ? error.message
            : 'La suppression a echoue. Merci de reessayer.',
        success: '',
      });
    }
  };

  const handleVisibilityToggle = async (item: DashboardItem) => {
    setVisibilityLoadingId(item._id);
    setFeedback({ error: '', success: '' });

    try {
      const response = await fetch(getEndpoint(activeTab, item._id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...item, isActive: !item.isActive }),
      });

      if (response.status === 401) {
        router.push('/admin/login');
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'La mise a jour de la visibilite a echoue.');
      }

      setItems((current) =>
        current.map((currentItem) =>
          currentItem._id === item._id ? (data as DashboardItem) : currentItem
        )
      );

      if (editingId === item._id) {
        setFormData(getFormDataFromItem(activeTab, data as DashboardItem));
      }

      setFeedback({
        error: '',
        success: data.isActive
          ? 'Le contenu est maintenant visible.'
          : 'Le contenu est maintenant masque.',
      });
    } catch (error) {
      console.error('Erreur de visibilite:', error);
      setFeedback({
        error:
          error instanceof Error
            ? error.message
            : 'La mise a jour de la visibilite a echoue.',
        success: '',
      });
    } finally {
      setVisibilityLoadingId(null);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout');
    router.push('/');
  };

  const getItemTitle = (item: DashboardItem) => item.title || item.name || 'Sans titre';

  const getItemDetails = (item: DashboardItem) => {
    if (activeTab === 'playlists') {
      return item.description || item.category || 'Playlist M3U';
    }

    if (activeTab === 'xtream') {
      return item.description || item.serverUrl || 'Acces Xtream';
    }

    if (activeTab === 'mac-portal') {
      return item.description || item.portalUrl || 'Portail Mac';
    }

    return item.description || item.downloadUrl || 'Application';
  };

  const getSecondaryLine = (item: DashboardItem) => {
    if (activeTab === 'xtream' && item.serverUrl) {
      return `Serveur: ${item.serverUrl}`;
    }

    if (activeTab === 'apps' && item.version) {
      return `Version: ${item.version}`;
    }

    if (activeTab === 'mac-portal' && item.portalUrl) {
      return item.portalUrl;
    }

    if (item.category) {
      return `Categorie: ${item.category}`;
    }

    return '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-700 bg-slate-900/95 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div>
            <h1 className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-3xl font-bold text-transparent">
              Ngori Admin
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Gerer, modifier et publier vos contenus depuis un seul ecran.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/admin/analytics"
              className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
            >
              📊 Analytics
            </a>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
            >
              Deconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-wrap gap-2">
          {TAB_ORDER.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-6 py-2 font-semibold transition ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {TAB_CONFIG[tab].tabLabel}
            </button>
          ))}
        </div>

        {feedback.error && (
          <div className="mb-6 rounded-lg border border-red-500/60 bg-red-500/10 px-4 py-3 text-red-100">
            {feedback.error}
          </div>
        )}

        {feedback.success && (
          <div className="mb-6 rounded-lg border border-emerald-500/60 bg-emerald-500/10 px-4 py-3 text-emerald-100">
            {feedback.success}
          </div>
        )}

        <div className="grid gap-8 xl:grid-cols-[1.25fr_0.95fr]">
          <section className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 backdrop-blur">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{config.heading}</h2>
                <p className="mt-1 text-sm text-slate-400">
                  {filteredItems.length} element(s) sur {items.length}
                </p>
              </div>

              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Rechercher dans cet onglet"
                className="w-full rounded-lg border border-slate-600 bg-slate-900/60 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-blue-500 lg:max-w-xs"
              />
            </div>

            {loading ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-white"></div>
                <p>Chargement...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <p className="py-8 text-center text-slate-400">
                {searchTerm ? 'Aucun resultat pour cette recherche.' : config.emptyLabel}
              </p>
            ) : (
              <div className="space-y-4">
                {filteredItems.map((item) => {
                  const secondaryLine = getSecondaryLine(item);
                  const isVisibilityLoading = visibilityLoadingId === item._id;

                  return (
                    <article
                      key={item._id}
                      className="rounded-lg border border-slate-600 bg-slate-700/40 p-4"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-white">
                              {getItemTitle(item)}
                            </h3>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                item.isActive
                                  ? 'bg-emerald-500/15 text-emerald-200'
                                  : 'bg-amber-500/15 text-amber-200'
                              }`}
                            >
                              {item.isActive ? 'Visible' : 'Masque'}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-slate-300">{getItemDetails(item)}</p>
                          {secondaryLine && (
                            <p className="mt-1 text-xs text-slate-400">{secondaryLine}</p>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white transition hover:bg-slate-950"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => void handleVisibilityToggle(item)}
                            disabled={isVisibilityLoading}
                            className="rounded-lg bg-amber-600 px-3 py-2 text-sm text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-amber-800"
                          >
                            {isVisibilityLoading
                              ? 'Patientez...'
                              : item.isActive
                                ? 'Masquer'
                                : 'Publier'}
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white transition hover:bg-red-700"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <section className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 backdrop-blur">
            {/* Mode toggle — only for types that support bulk import */}
            {activeTab !== 'apps' && !editingId && (
              <div className="mb-6 flex items-center gap-3">
                <button
                  onClick={() => setBulkMode(false)}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    !bulkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  ✏️ Ajout unitaire
                </button>
                <button
                  onClick={() => setBulkMode(true)}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    bulkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  📦 Import en masse
                </button>
              </div>
            )}

            {bulkMode && activeTab !== 'apps' ? (
              <BulkImport
                activeTab={activeTab}
                onImportComplete={() => {
                  // Reload items after bulk import
                  const controller = new AbortController();
                  async function reload() {
                    try {
                      const response = await fetch(getEndpoint(activeTab), {
                        signal: controller.signal,
                      });
                      if (response.ok) {
                        const data = (await response.json()) as DashboardItem[];
                        setItems(data);
                      }
                    } catch {
                      // silently ignore
                    }
                  }
                  void reload();
                  return () => controller.abort();
                }}
              />
            ) : (
              <>
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="mb-2 text-xl font-bold text-white">
                      {editingId ? 'Modifier le contenu' : config.heading}
                    </h2>
                    <p className="text-sm text-slate-400">
                      {editingId
                        ? 'Appliquez vos changements puis enregistrez.'
                        : 'Remplissez les champs ci-dessous pour publier un nouvel element.'}
                    </p>
                  </div>

                  {editingId && (
                    <button
                      onClick={resetForm}
                      className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-400"
                    >
                      Annuler
                    </button>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                  {config.fields.map((field) => {
                    if (field.type === 'checkbox') {
                      return (
                        <label
                          key={field.name}
                          className="md:col-span-2 flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-900/40 px-4 py-3 text-slate-200"
                        >
                          <input
                            type="checkbox"
                            checked={Boolean(formData[field.name])}
                            onChange={(event) =>
                              handleFieldChange(field.name, event.target.checked)
                            }
                            className="h-4 w-4 rounded border-slate-500 bg-slate-800"
                          />
                          <span>{field.label}</span>
                        </label>
                      );
                    }

                    const isTextarea = field.type === 'textarea';

                    return (
                      <label
                        key={field.name}
                        className={isTextarea ? 'md:col-span-2' : ''}
                      >
                        <span className="mb-2 block text-sm font-medium text-slate-200">
                          {field.label}
                        </span>

                        {isTextarea ? (
                          <textarea
                            value={String(formData[field.name] ?? '')}
                            onChange={(event) =>
                              handleFieldChange(field.name, event.target.value)
                            }
                            placeholder={field.placeholder}
                            required={field.required}
                            rows={field.name === 'content' ? 8 : 4}
                            className="w-full rounded-lg border border-slate-600 bg-slate-900/60 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-blue-500"
                          />
                        ) : (
                          <input
                            type={field.type || 'text'}
                            value={String(formData[field.name] ?? '')}
                            onChange={(event) =>
                              handleFieldChange(field.name, event.target.value)
                            }
                            placeholder={field.placeholder}
                            required={field.required}
                            className="w-full rounded-lg border border-slate-600 bg-slate-900/60 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-blue-500"
                          />
                        )}
                      </label>
                    );
                  })}

                  <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-800"
                    >
                      {submitting
                        ? 'Enregistrement...'
                        : editingId
                          ? config.updateLabel
                          : config.submitLabel}
                    </button>

                    {editingId && (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="rounded-lg border border-slate-600 px-6 py-3 font-semibold text-slate-200 transition hover:border-slate-400"
                      >
                        Reinitialiser
                      </button>
                    )}
                  </div>
                </form>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
