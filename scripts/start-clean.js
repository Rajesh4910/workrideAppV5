#!/usr/bin/env node
// Clear environment variables that break expo's getenv parsing,
// then spawn the Expo CLI in a child process inheriting the cleaned env.
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const cleanedEnv = { ...process.env };
delete cleanedEnv.CI;
delete cleanedEnv.EXPO_DEBUG;
delete cleanedEnv.EXPO_NO_DOCTOR;

const providedArgs = process.argv.slice(2);

// Prefer a locally installed `expo` binary (node_modules/.bin/expo),
// fall back to `npx expo ...` when not present. This avoids cross-spawn
// ENOENT issues when npm symlinks are not available on Windows.
const localExpo = path.join(process.cwd(), 'node_modules', '.bin', 'expo' + (process.platform === 'win32' ? '.cmd' : ''));
let command;
let args;

if (fs.existsSync(localExpo)) {
	command = localExpo;
	// If the script was invoked like: node start-clean.js expo start --android
	// the first provided arg will be 'expo' which would be passed to the
	// local binary again. Strip it so args become ['start','--android'].
	if (providedArgs.length && providedArgs[0] === 'expo') {
		args = providedArgs.slice(1);
	} else {
		args = providedArgs.length ? providedArgs : ['start'];
	}
} else {
	command = 'npx';
	args = providedArgs.length ? providedArgs : ['expo', 'start'];
}

let child;
if (process.platform === 'win32' && fs.existsSync(localExpo)) {
	// On Windows, invoking the .cmd directly can still produce ENOENT under
	// some shells. Use `cmd /c` to run the .cmd shim reliably.
	const winArgs = ['/c', localExpo].concat(args || []);
	console.log('Spawning cmd', winArgs.join(' '));
	child = spawn('cmd', winArgs, { stdio: 'inherit', env: cleanedEnv, shell: false });
} else {
	const useShell = process.platform === 'win32';
	console.log('Spawning', command, args.join(' '));
	child = spawn(command, args, { stdio: 'inherit', env: cleanedEnv, shell: useShell });
}
child.on('error', (err) => {
	console.error('Failed to spawn Expo process:', err && err.message ? err.message : err);
	process.exit(1);
});
child.on('exit', (code) => process.exit(code));
