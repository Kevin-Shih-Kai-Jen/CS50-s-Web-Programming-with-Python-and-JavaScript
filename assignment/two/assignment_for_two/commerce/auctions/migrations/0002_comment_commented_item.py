# Generated by Django 5.1.7 on 2025-04-21 07:20

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("auctions", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="comment",
            name="commented_item",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                to="auctions.createlisting",
            ),
        ),
    ]
