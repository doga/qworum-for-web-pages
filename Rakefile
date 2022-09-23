# Rakefile

# Dependencies: jsdoc (`npm install -g jsdoc`)

# TODO change the jsdoc template to https://github.com/UnityBaseJS/ub-jsdoc

task default: :help

desc 'Show available Rake tasks'
task :help do
    sh "rake -T"
end

desc 'Build the documentation'
task :docs do
  # jsdoc needs a .js file not .mjs, so make a copy
  tmpfile = 'tmp/qworum-for-web-pages.js'
  cp 'qworum-for-web-pages.mjs', tmpfile

  # generate the documentation
  sh "jsdoc #{tmpfile} -d docs --readme README.md"
end
