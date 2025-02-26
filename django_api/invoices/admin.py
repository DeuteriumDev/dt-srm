from django.contrib import admin
from .models import Invoice, LineItem, Item

# Register your models here.
admin.site.register(Invoice)
admin.site.register(LineItem)
admin.site.register(Item)
