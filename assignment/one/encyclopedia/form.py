from django import forms

class NewPage(forms.Form):
    new_title = forms.CharField(label="new_title", max_length=30)
    new_content = forms.CharField(label="new_content", widget=forms.Textarea)           
