import markdown

def converter(var):
    with open(var, 'r') as f:
        tempMd = f.read()
        
    tempHTML = markdown.markdown(tempMd)
    
    return tempHTML



