# Generated by Django 4.2.6 on 2024-12-20 03:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('task_app', '0002_remove_todoitem_subtask_subtask_assigned_to_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='subtask',
            name='status',
            field=models.CharField(blank=True, choices=[('Incomplete', 'Incomplete'), ('Complete', 'Complete'), ('Pending', 'Pending')], default=None, max_length=20, null=True),
        ),
    ]
