# tree

this code was shamelessly stolen from [django-tree-queries](https://github.com/feincms/django-tree-queries/tree/main)

I had to make the following modifications:
- change the queryset to use polymorphic-query
- change the model to use polymorphic-manager
- drop the [clean()] validation (no idea why this was causing issues)