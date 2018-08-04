
def include(doc, name, **args):
    name = name.lower()
    if name.find(":") == -1:
        doc = doc.docsite.doc_get(name, die=False)
        if doc==None:
            #walk over all docsites
            res=[]
            for key,ds in j.tools.markdowndocs.docsites.items():
                doc = ds.doc_get(name, die=False)
                if doc != None:
                    res.append(doc)
            if len(res)==1:
                doc=res[0]
            else:
                #did not find or more than 1
                doc = None
                
        if doc != None:            
            newcontent = doc.markdown
        else:
            raise RuntimeError("ERROR: COULD NOT INCLUDE:%s (not found)" % name)

    else:
        docsiteName, name = name.split(":")
        docsite = j.tools.markdowndocs.docsite_get(docsiteName)
        doc = docsite.doc_get(name, die=False)
        if doc != None:
            newcontent = doc.markdown
        else:
            raise RuntimeError("ERROR: COULD NOT INCLUDE:%s:%s (not found)" % (docsiteName, name))

    # if name in self._contentPaths:
    #     newcontent0 = j.sal.fs.fileGetContents(self._contentPaths[name])
    #
    #     newcontent = ""
    #
    #     pre = "#" * self.last_level
    #
    #     for line in newcontent0.split("\n"):
    #         if line.find("#") != -1:
    #             line = pre + line
    #         newcontent += "%s\n" % line

    return newcontent
