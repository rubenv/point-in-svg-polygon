module.exports = function (grunt) {
    grunt.loadNpmTasks("grunt-browserify");
    grunt.loadNpmTasks("grunt-bump");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-jscs");
    grunt.loadNpmTasks("grunt-mocha-cli");

    grunt.initConfig({
        clean: {
            dist: ["dist"]
        },
        jshint: {
            all: ["lib/*.js", "test/*.js"],
            options: {
                jshintrc: ".jshintrc"
            }
        },
        jscs: {
            src: {
                options: {
                    config: ".jscs.json"
                },
                files: {
                    src: ["lib/*.js", "test/*.js"]
                }
            }
        },
        watch: {
            all: {
                options: {
                    atBegin: true
                },
                files: ["lib/**.js", "test/*{,/*}"],
                tasks: ["test"]
            }
        },
        mochacli: {
            options: {
                files: "test/*.js"
            },
            spec: {
                options: {
                    reporter: "spec"
                }
            }
        },
        browserify: {
            dist: {
                files: {
                    "dist/point-in-svg-polygon.js": ["lib/index.js"]
                },
                options: {
                    alias: {
                        "point-in-svg-polygon": "./lib/index.js",
                    }
                }
            }
        },
        uglify: {
            dist: {
                files: {
                    "dist/point-in-svg-polygon.min.js": "dist/point-in-svg-polygon.js"
                }
            }
        },
        bump: {
            options: {
                files: ["package.json", "bower.json"],
                commitFiles: ["-a"],
                pushTo: "origin"
            }
        }
    });

    grunt.registerTask("default", ["test"]);
    grunt.registerTask("build", ["clean", "jshint", "jscs", "browserify", "uglify"]);
    grunt.registerTask("test", ["build", "mochacli"]);
};
