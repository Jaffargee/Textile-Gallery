import wikipediaapi

wiki_wiki = wikipediaapi.Wikipedia(user_agent='MyProjectName (merlin@example.com)', language='en')

page_py = wiki_wiki.page('Python (programming language)')

print(page_py)
print("Page - Exists: %s" % page_py.exists())
print("Page - Title: %s" % page_py.title)
print("Page - Summary: %s" % page_py.summary)