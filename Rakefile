# Rakefile

# Dependencies: jsdoc (`npm install -g jsdoc`)

# TODO change the jsdoc template to https://github.com/UnityBaseJS/ub-jsdoc

task default: :help

desc 'Show available Rake tasks'
task :help do
    sh "rake -T"
end

desc 'Build the documentation'
task docs: [:clear_docs] do
  # jsdoc needs a .js file not .mjs, so make a copy
  tmpfile = 'tmp/qworum-for-web-pages.js'
  cp 'qworum-for-web-pages.mjs', tmpfile

  # generate the documentation
  sh "npm run generate-docs" # prefer this template 
  # sh "jsdoc #{tmpfile} -d docs --readme README.md" # default template (Google doesn't like it)
end

desc 'Empty the docs directory'
task :clear_docs do
  begin
    sh "trash docs/*"
  rescue
  end
end
