<script lang="ts">
  import { firekitUser, firekitAuth } from '$lib';
  import { onMount } from 'svelte';

  let email = '';
  let password = '';
  let displayName = '';
  let isRegistering = false;
  let errorMessage = '';

  async function handleSubmit() {
    errorMessage = '';
    
    try {
      if (isRegistering) {
        // Register new user
        const result = await firekitAuth.registerWithEmail(email, password, displayName);
        if (!result.success) {
          errorMessage = result.message;
        }
      } else {
        // Login existing user
        const result = await firekitAuth.signInWithEmail(email, password);
        if (!result.success) {
          errorMessage = result.message;
        }
      }
    } catch (error: any) {
      errorMessage = error.message || 'An unknown error occurred';
    }
  }

  // Handle Google sign-in
  async function signInWithGoogle() {
    errorMessage = '';
    
    try {
      const result = await firekitAuth.signInWithGoogle();
      if (!result.success) {
        errorMessage = result.message;
      }
    } catch (error: any) {
      errorMessage = error.message || 'An unknown error occurred';
    }
  }

  // Handle sign out
  async function signOut() {
    await firekitAuth.logOut();
  }
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold mb-6 text-center">SvelteKit Firebase Starter</h1>
  
  {#if $firekitUser.isLoading}
    <div class="flex justify-center">
      <div class="animate-pulse bg-gray-200 h-10 w-40 rounded"></div>
    </div>
  {:else if $firekitUser.uid}
    <!-- Logged in state -->
    <div class="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 class="text-2xl font-semibold mb-4">Welcome, {$firekitUser.displayName || 'User'}</h2>
      
      <div class="flex items-center space-x-4 mb-6">
        {#if $firekitUser.photoURL}
          <img src={$firekitUser.photoURL} alt="Profile" class="w-12 h-12 rounded-full" />
        {:else}
          <div class="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white">
            {($firekitUser.displayName?.[0] || $firekitUser.email?.[0] || 'U').toUpperCase()}
          </div>
        {/if}
        
        <div>
          <p class="text-gray-700">{$firekitUser.email}</p>
          <p class="text-sm text-gray-500">
            {$firekitUser.emailVerified ? '✓ Email verified' : '! Email not verified'}
          </p>
        </div>
      </div>
      
      <button
        on:click={signOut}
        class="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition duration-200"
      >
        Sign Out
      </button>
    </div>
  {:else}
    <!-- Login/Register form -->
    <div class="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 class="text-2xl font-semibold mb-4 text-center">
        {isRegistering ? 'Create Account' : 'Sign In'}
      </h2>
      
      <form on:submit|preventDefault={handleSubmit} class="space-y-4">
        {#if isRegistering}
          <div>
            <label for="displayName" class="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              bind:value={displayName}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        {/if}
        
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            bind:value={email}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            bind:value={password}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        {#if errorMessage}
          <div class="text-red-500 text-sm py-2">{errorMessage}</div>
        {/if}
        
        <button
          type="submit"
          class="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition duration-200"
        >
          {isRegistering ? 'Register' : 'Sign In'}
        </button>
      </form>
      
      <div class="mt-4">
        <button
          on:click={signInWithGoogle}
          class="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded flex items-center justify-center hover:bg-gray-50 transition duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            class="mr-2"
          >
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
            <path fill="none" d="M1 1h22v22H1z" />
          </svg>
          Continue with Google
        </button>
      </div>
      
      <div class="mt-4 text-center text-sm text-gray-600">
        {#if isRegistering}
          Already have an account?
          <button
            on:click={() => (isRegistering = false)}
            class="text-blue-500 hover:text-blue-700"
          >
            Sign in
          </button>
        {:else}
          Need an account?
          <button
            on:click={() => (isRegistering = true)}
            class="text-blue-500 hover:text-blue-700"
          >
            Register
          </button>
        {/if}
      </div>
    </div>
  {/if}
  
  <div class="mt-12 text-center text-gray-600">
    <p class="text-sm">
      This is a SvelteKit + Firebase template with Tailwind CSS.
      <br />Configure Firebase by setting environment variables in a <code>.env</code> file.
    </p>
  </div>
</div>
