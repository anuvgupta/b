#!/usr/bin/env node

/**
 * b.js v1
 *
 * (convert to ts later)
 */

const Fs = require("fs");
const ChildProcess = require("child_process");

// console.log();
// console.log("b");
// console.log();
const prefix = "[b]";

// get build directory & target
var buildTarget = "";
var buildDirectory = "";
const args = process.argv.slice(2);
if (args.length >= 1) {
    buildTarget = `${args[0].toString()}`;
    if (args.length >= 2) {
        buildDirectory = `${args[1].toString()}`;
    }
}
if (buildTarget === "") {
    buildTarget = "build";
}
if (buildDirectory === "") {
    buildDirectory = `${process.cwd()}`;
}

// read build config file
const buildFilePath = `${buildDirectory}/b.json`;
if (!Fs.existsSync(buildFilePath)) {
    console.error(`${prefix} Build config file ${buildFilePath} not found`);
    process.exit(1);
}
const buildFileData = Fs.readFileSync(buildFilePath, {
    encoding: "utf8",
    flag: "r",
});

// parse build config file
var buildConfig;
try {
    buildConfig = JSON.parse(buildFileData);
} catch (e) {
    console.error(
        `${prefix} Invalid JSON in build config file ${buildFilePath}`
    );
    console.error(e);
    process.exit(1);
}

// get build package name
if (!buildConfig.hasOwnProperty("package")) {
    console.error(
        `${prefix} Build package not present in build config ${buildFilePath}`
    );
    process.exit(1);
}
const buildPackage = buildConfig.package;

// get build target list
if (!buildConfig.hasOwnProperty("targets")) {
    console.error(
        `${prefix} Build targets not present in build config ${buildFilePath}`
    );
    process.exit(1);
}
const buildTargets = buildConfig.targets;

// get build target command
if (!buildTargets.hasOwnProperty(buildTarget)) {
    // translate build target shorthand
    var options = [];
    for (var buildTargetOption in buildTargets) {
        if (buildTargetOption[0] === buildTarget[0]) {
            options.push(buildTargetOption);
        }
    }
    if (options.length >= 1) {
        buildTarget = options[0];
    } else {
        console.error(
            `${prefix} Build target ${buildTarget} not found in targets for build config ${buildFilePath}`
        );
        process.exit(1);
    }
}
const buildTargetCommand = buildTargets[buildTarget];

// print target configuration
console.log(`${prefix} > ${buildPackage} ${buildTarget}`);
console.log(`${prefix} > ${buildDirectory}`);
console.log(`${prefix} > ${buildTargetCommand}`);
console.log();

// execute target command
const buildTargetProcess = ChildProcess.spawn(`${buildTargetCommand}`, {
    shell: true,
    stdio: "inherit",
    cwd: buildDirectory,
});
buildTargetProcess.on("close", (code) => {
    console.log();
    const message = `${prefix} Build target process exited with code ${code}`;
    if (code === 0) {
        console.log(message);
    } else {
        console.error(message);
    }
});
