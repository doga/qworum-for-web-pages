# Rakefile

# This library on GitHub    : <https://github.com/doga/qworum-for-web-pages>
# This library on NPM       : <https://www.npmjs.com/package/@qworum/qworum-for-web-pages>
# This library on Skypack   : <https://cdn.skypack.dev/@qworum/qworum-for-web-pages>
# On Skypack with versioning: <https://cdn.skypack.dev/@qworum/qworum-for-web-pages@1.0.9>
# Docs for this library     : <https://qworum.net/docs/qworum-for-web-pages/latest/>

# To publish this library on Skypack:
# 1. Check Skypack compatibility by running `npm run skypack-check`
# 2. Publish on NPM (`npm publish --access public`)
# 3. Fetch the versioned Skypack URL with a browser or with curl. If Skypack hasn't cached the version yet,
#    then it will look it up on NPM.

# Dev dependencies: jsdoc (`npm install -g jsdoc`)

# TODO Task for adding a new library version to the Skypack CDN.

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
