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
        name: 'packageId',
        label: 'Package ID (facultatif, Google Play)',
        placeholder: 'Ex: com.whatsapp',
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
    packageId: '',
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
  const [fetchingPlay, setFetchingPlay] = useState(false);
  const [fetchingCron, setFetchingCron] = useState(false);
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

  const handleFetchGooglePlay = async () => {
    const pkgId = String(formData.packageId || '').trim();
    if (!pkgId) {
      setFeedback({ error: "Veuillez entrer un Package ID d'abord (champ ci-dessous).", success: '' });
      return;
    }
    setFetchingPlay(true);
    setFeedback({ error: '', success: '' });
    try {
      const res = await fetch('/api/admin/apps/fetch-from-play', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: pkgId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur Play Store');
      
      setFormData((prev) => ({
        ...prev,
        name: data.name || '',
        description: data.description || '',
        icon: data.icon || '',
        version: data.version || '',
        fileSize: data.fileSize || '',
        category: data.category || '',
        downloadUrl: data.downloadUrl || '',
      }));
      setFeedback({ error: '', success: 'Informations récupérées avec succès ! Vous pouvez vérifier et enregistrer.' });
    } catch (error: any) {
      setFeedback({ error: error.message, success: '' });
    } finally {
      setFetchingPlay(false);
    }
  };

  const handleCronScrape = async () => {
    setFetchingCron(true);
    setFeedback({ error: '', success: '' });
    try {
      const res = await fetch('/api/cron/scrape-apkpure', {
        headers: { 'Authorization': `Bearer ngori_cron_secret_2026_xK9mP3` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur fetch scraping');
      setFeedback({ 
        error: '', 
        success: data.success ? `Scraping terminé: ${data.added?.length} app(s) ajoutée(s). Veuillez rafraîchir la page.` : data.message 
      });
    } catch (error: any) {
      setFeedback({ error: error.message, success: '' });
    } finally {
      setFetchingCron(false);
    }
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
      const src = (item as any).source ? `[${(item as any).source}] ` : '';
      return `${src}Version: ${item.version}`;
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
    <>
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-wrap gap-2">
          {TAB_ORDER.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-6 py-2 font-semibold transition ${
                activeTab === tab
                  ? 'bg-[#5E6AD2] text-[#E8E8ED]'
                  : 'bg-white/[0.04] text-[#8B8B9E] hover:bg-white/[0.08] hover:text-[#E8E8ED]'
              }`}
            >
              {TAB_CONFIG[tab].tabLabel}
            </button>
          ))}
        </div>

        {feedback.error && (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-400">
            {feedback.error}
          </div>
        )}

        {feedback.success && (
          <div className="mb-6 rounded-lg border border-[#4ADE80]/20 bg-[#4ADE80]/10 px-4 py-3 text-[#4ADE80]">
            {feedback.success}
          </div>
        )}

        <div className="grid gap-8 xl:grid-cols-[1.25fr_0.95fr]">
          <section className="rounded-xl border border-white/[0.06] bg-[#111118] p-6">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#E8E8ED]">{config.heading}</h2>
                <p className="mt-1 text-sm text-[#5C5C72]">
                  {filteredItems.length} element(s) sur {items.length}
                </p>
              </div>

              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Rechercher dans cet onglet"
                className="w-full rounded-lg border border-white/[0.06] bg-[#0A0A0F] px-4 py-3 text-[#E8E8ED] placeholder-[#5C5C72] outline-none transition focus:border-[#5E6AD2] lg:max-w-xs"
              />
            </div>

            {loading ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-[#5E6AD2]"></div>
                <p>Chargement...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <p className="py-8 text-center text-[#5C5C72]">
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
                      className="rounded-lg border border-white/[0.06] bg-[#0A0A0F] p-4"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-[#E8E8ED]">
                              {getItemTitle(item)}
                            </h3>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                item.isActive
                                  ? 'bg-[#4ADE80]/15 text-[#4ADE80]'
                                  : 'bg-[#D4A843]/15 text-[#D4A843]'
                              }`}
                            >
                              {item.isActive ? 'Visible' : 'Masque'}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-[#8B8B9E]">{getItemDetails(item)}</p>
                          {secondaryLine && (
                            <p className="mt-1 text-xs text-[#5C5C72]">{secondaryLine}</p>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="rounded-lg bg-white/[0.06] px-3 py-2 text-sm text-[#E8E8ED] transition hover:bg-white/[0.1]"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => void handleVisibilityToggle(item)}
                            disabled={isVisibilityLoading}
                            className="rounded-lg bg-[#D4A843]/80 px-3 py-2 text-sm text-[#E8E8ED] transition hover:bg-[#D4A843] disabled:cursor-not-allowed disabled:bg-[#D4A843]/50"
                          >
                            {isVisibilityLoading
                              ? 'Patientez...'
                              : item.isActive
                                ? 'Masquer'
                                : 'Publier'}
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="rounded-lg bg-red-500/80 px-3 py-2 text-sm text-[#E8E8ED] transition hover:bg-red-500"
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

          <section className="rounded-xl border border-white/[0.06] bg-[#111118] p-6">
            {/* Mode toggle — only for types that support bulk import */}
            {activeTab !== 'apps' && !editingId && (
              <div className="mb-6 flex items-center gap-3">
                <button
                  onClick={() => setBulkMode(false)}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition flex items-center gap-2 ${
                    !bulkMode
                      ? 'bg-[#5E6AD2] text-[#E8E8ED]'
                      : 'bg-white/[0.04] text-[#8B8B9E] hover:bg-white/[0.08] hover:text-[#E8E8ED]'
                  }`}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Ajout unitaire
                </button>
                <button
                  onClick={() => setBulkMode(true)}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition flex items-center gap-2 ${
                    bulkMode
                      ? 'bg-[#5E6AD2] text-[#E8E8ED]'
                      : 'bg-white/[0.04] text-[#8B8B9E] hover:bg-white/[0.08] hover:text-[#E8E8ED]'
                  }`}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                  Import en masse
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
                    <h2 className="mb-2 text-xl font-bold text-[#E8E8ED]">
                      {editingId ? 'Modifier le contenu' : config.heading}
                    </h2>
                    <p className="text-sm text-[#5C5C72]">
                      {editingId
                        ? 'Appliquez vos changements puis enregistrez.'
                        : 'Remplissez les champs ci-dessous pour publier un nouvel element.'}
                    </p>
                  </div>

                  {editingId && (
                    <button
                      onClick={resetForm}
                      className="linear-btn linear-btn-ghost text-sm"
                    >
                      Annuler
                    </button>
                  )}
                </div>

                {activeTab === 'apps' && (
                  <div className="mb-6 rounded-lg border border-[#5E6AD2]/20 bg-[#5E6AD2]/5 p-4 flex flex-col md:flex-row items-center gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#8B93E6]">Ajout Magique (Google Play)</h3>
                      <p className="text-xs text-[#5C5C72] mt-1">Saisissez un Package ID dans le formulaire et cliquez ici pour tout pré-remplir.</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleFetchGooglePlay}
                        disabled={fetchingPlay}
                        className="rounded-lg bg-[#5E6AD2] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#7C6BF7] disabled:opacity-50"
                      >
                         {fetchingPlay ? 'Recherche...' : 'Récupérer (Infos)'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCronScrape}
                        disabled={fetchingCron}
                        className="rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-4 py-2 text-sm font-medium transition hover:bg-emerald-500/30 disabled:opacity-50"
                      >
                        {fetchingCron ? 'Scraping...' : 'Lancer Scraping (APKPure)'}
                      </button>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                  {config.fields.map((field) => {
                    if (field.type === 'checkbox') {
                      return (
                        <label
                          key={field.name}
                          className="md:col-span-2 flex items-center gap-3 rounded-lg border border-white/[0.06] bg-[#0A0A0F] px-4 py-3 text-[#8B8B9E]"
                        >
                          <input
                            type="checkbox"
                            checked={Boolean(formData[field.name])}
                            onChange={(event) =>
                              handleFieldChange(field.name, event.target.checked)
                            }
                            className="h-4 w-4 rounded border-white/[0.12] bg-[#0A0A0F]"
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
                        <span className="mb-2 block text-sm font-medium text-[#8B8B9E]">
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
                            className="w-full rounded-lg border border-white/[0.06] bg-[#0A0A0F] px-4 py-3 text-[#E8E8ED] placeholder-[#5C5C72] outline-none transition focus:border-[#5E6AD2]"
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
                            className="w-full rounded-lg border border-white/[0.06] bg-[#0A0A0F] px-4 py-3 text-[#E8E8ED] placeholder-[#5C5C72] outline-none transition focus:border-[#5E6AD2]"
                          />
                        )}
                      </label>
                    );
                  })}

                  <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 linear-btn linear-btn-primary"
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
                        className="linear-btn linear-btn-ghost"
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
    </>
  );
}
