# Rakefile

# Dependencies: jsdoc (`npm install -g jsdoc`)

task default: :help

desc 'Show available Rake tasks'
task :help do
    sh "rake -T"
end

desc 'Build'
task :build do
    sh "npm run build"
end

desc 'Publish to NPM'
task :publish do
    sh "npm run publish-to-npm"
end

desc 'Build a TypeScript types file from JSdoc comments'
task :types do
    sh "npm run create-types" # .mjs extension not supported!!!
    # sh "tsc --allowJs -d --emitDeclarationOnly qworum-for-web-pages.js" # .mjs extension not supported!!!
end

desc 'Create the HTML documentation from JSdoc comments'
task docs: [:clear_docs] do
  sh "npm run generate-docs"
  # sh "jsdoc #{tmpfile} -d docs --readme README.md" # default template (Google doesn't like it)
end

desc 'Check Skypack.dev compatibility'
task :skypack_check do
  sh "npm run skypack-check"
end

desc 'Empty the docs directory'
task :clear_docs do
  begin
    sh "trash docs/*"
  rescue
  end
end
