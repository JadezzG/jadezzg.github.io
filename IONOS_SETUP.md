# Ionos DNS Setup Instructions

## Problem: Too Many Redirects (ERR_TOO_MANY_REDIRECTS)

If you're experiencing redirect loops with roxmanager.com, follow these steps to properly configure your Ionos DNS settings:

## Step 1: Remove All HTTP Redirects

1. Log in to your Ionos account
2. Go to Domains & SSL > Domain Center > roxmanager.com
3. Look for any "Domain Forwarding," "Redirects," or "URL Forwarding" settings
4. **Delete or disable all redirects**

## Step 2: Configure DNS Settings Correctly

Set up these DNS records:

### For GitHub Pages:

1. Add a CNAME record:
   - Host: www
   - Points to: jadezzg.github.io
   - TTL: Automatic or 3600

2. Add an A record for the root domain:
   - Host: @ (or leave empty)
   - Points to: 185.199.108.153 (GitHub Pages IP)
   - TTL: Automatic or 3600

3. Add these additional A records with the same settings:
   - 185.199.109.153
   - 185.199.110.153
   - 185.199.111.153

## Step 3: Wait for DNS Propagation

After making these changes, wait 24-48 hours for DNS changes to fully propagate before testing again.

## Step 4: Clear Browser Cache

Clear your browser cache completely before testing the website again.

## Important Notes

- Do not enable any redirection services at Ionos
- Make sure you're using DNS records (CNAME and A records), not HTTP redirects
- Once DNS is working correctly, restore the CNAME file to your GitHub repository 