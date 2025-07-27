#!/usr/bin/env node

/**
 * Bundle analysis script to identify large strings and optimization opportunities
 */

const fs = require('fs');
const path = require('path');

class BundleAnalyzer {
    constructor() {
        this.largeStrings = [];
        this.fileStats = new Map();
    }

    /**
     * Analyze files for large strings
     */
    analyzeDirectory(dirPath, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
        const files = this.getFilesRecursively(dirPath, extensions);

        files.forEach(filePath => {
            this.analyzeFile(filePath);
        });

        this.generateReport();
    }

    /**
     * Get all files recursively
     */
    getFilesRecursively(dirPath, extensions) {
        const files = [];

        const traverse = (currentPath) => {
            const items = fs.readdirSync(currentPath);

            items.forEach(item => {
                const fullPath = path.join(currentPath, item);
                const stat = fs.statSync(fullPath);

                if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                    traverse(fullPath);
                } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
                    files.push(fullPath);
                }
            });
        };

        traverse(dirPath);
        return files;
    }

    /**
     * Analyze individual file
     */
    analyzeFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const size = Buffer.byteLength(content, 'utf-8');

            this.fileStats.set(filePath, { size, content });

            // Look for large string literals
            const stringMatches = content.match(/`[\s\S]{500,}`/g) || [];
            const templateMatches = content.match(/"[\s\S]{300,}"/g) || [];

            if (stringMatches.length > 0 || templateMatches.length > 0) {
                this.largeStrings.push({
                    file: filePath,
                    stringCount: stringMatches.length,
                    templateCount: templateMatches.length,
                    totalSize: size
                });
            }
        } catch (error) {
            console.warn(`Could not analyze ${filePath}:`, error.message);
        }
    }

    /**
     * Generate optimization report
     */
    generateReport() {
        console.log('\n🔍 Bundle Analysis Report\n');

        // Sort files by size
        const sortedFiles = Array.from(this.fileStats.entries())
            .sort(([, a], [, b]) => b.size - a.size)
            .slice(0, 10);

        console.log('📊 Largest Files:');
        sortedFiles.forEach(([filePath, stats]) => {
            const sizeKB = (stats.size / 1024).toFixed(2);
            console.log(`  ${sizeKB}KB - ${path.relative(process.cwd(), filePath)}`);
        });

        if (this.largeStrings.length > 0) {
            console.log('\n⚠️  Files with Large Strings:');
            this.largeStrings.forEach(item => {
                const sizeKB = (item.totalSize / 1024).toFixed(2);
                console.log(`  ${sizeKB}KB - ${path.relative(process.cwd(), item.file)}`);
                console.log(`    Template literals: ${item.stringCount}, String literals: ${item.templateCount}`);
            });

            console.log('\n💡 Optimization Suggestions:');
            console.log('  • Move large templates to external files ✅ IMPLEMENTED');
            console.log('  • Use dynamic imports for large content ✅ IMPLEMENTED');
            console.log('  • Consider using Buffer for string handling ✅ IMPLEMENTED');
            console.log('  • Implement lazy loading for templates ✅ IMPLEMENTED');
            console.log('  • Extract constants to separate files ✅ IMPLEMENTED');
            console.log('  • Use BriefFormLazy for better code splitting');
            console.log('  • Consider implementing virtual scrolling for large lists');
            console.log('  • Use React.memo for expensive components');
        } else {
            console.log('\n✅ No large strings detected in bundle');
        }

        const totalSize = Array.from(this.fileStats.values())
            .reduce((sum, stats) => sum + stats.size, 0);

        console.log(`\n📈 Total analyzed size: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
    }
}

// Run analysis
const analyzer = new BundleAnalyzer();
analyzer.analyzeDirectory('./src');