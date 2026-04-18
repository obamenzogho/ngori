# Routes CRON Ngori

Ce document répertorie les points d'entrée API sécurisés à configurer sur **cron-job.org**.

## Accès Sécurisé
Chaque requête **DOIT** inclure le header suivant :
- **Header**: `Authorization`
- **Valeur**: `Bearer [VOTRE_CRON_SECRET]`

> [!IMPORTANT]
> Remplacez `[VOTRE_CRON_SECRET]` par la valeur définie dans vos variables d'environnement Vercel (`CRON_SECRET`).

---

## 1. Agrégation Analytics
Compile les événements bruts (clics, vues) en rapports quotidiens.
- **URL**: `https://ngori-rho.vercel.app/api/cron/analytics`
- **Méthode**: `GET`
- **Fréquence conseillée**: Toutes les heures (`0 * * * *`)

## 2. Mise à jour versions applications
Vérifie et met à jour les métadonnées des applications actives.
- **URL**: `https://ngori-rho.vercel.app/api/cron/update-apps`
- **Méthode**: `GET`
- **Fréquence conseillée**: Une fois par jour (`0 2 * * *`)

## 3. Nettoyage des données expirées
Supprime les événements bruts vieux de plus de 90 jours pour libérer de l'espace.
- **URL**: `https://ngori-rho.vercel.app/api/cron/cleanup`
- **Méthode**: `GET`
- **Fréquence conseillée**: Une fois par jour à minuit (`0 0 * * *`)

---

## Test rapide (cURL)
```bash
curl -X GET "https://ngori-rho.vercel.app/api/cron/analytics" \
     -H "Authorization: Bearer VOTRE_SECRET_ICI"
```
