import fs from 'fs/promises';
import path from 'path';

const NEW_VERSION = '3.0.0';
const PACKAGES_DIR = './packages';

async function syncVersions() {
    const rootPackageJsonPath = './package.json';
    const rootPkg = JSON.parse(await fs.readFile(rootPackageJsonPath, 'utf-8'));
    rootPkg.version = NEW_VERSION;
    await fs.writeFile(rootPackageJsonPath, JSON.stringify(rootPkg, null, 2) + '\n');
    console.log(`Updated root package.json to ${NEW_VERSION}`);

    const packages = await fs.readdir(PACKAGES_DIR);

    for (const pkgName of packages) {
        const pkgPath = path.join(PACKAGES_DIR, pkgName, 'package.json');
        try {
            const content = await fs.readFile(pkgPath, 'utf-8');
            const pkg = JSON.parse(content);
            pkg.version = NEW_VERSION;

            // Update dependencies if they are internal @phantom-pm packages
            if (pkg.dependencies) {
                for (const dep of Object.keys(pkg.dependencies)) {
                    if (dep.startsWith('@phantom-pm/')) {
                        pkg.dependencies[dep] = NEW_VERSION;
                    }
                }
            }
            if (pkg.devDependencies) {
                for (const dep of Object.keys(pkg.devDependencies)) {
                    if (dep.startsWith('@phantom-pm/')) {
                        pkg.devDependencies[dep] = NEW_VERSION;
                    }
                }
            }

            await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
            console.log(`Updated ${pkgName}/package.json to ${NEW_VERSION}`);
        } catch (e) {
            // Skip directories without package.json
        }
    }
}

syncVersions().catch(console.error);
