# Generated by Django 5.1.4 on 2025-02-25 17:40

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("documents", "0003_lineitem_position"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="documentnodemodel",
            options={"managed": True, "ordering": ["created"]},
        ),
    ]
