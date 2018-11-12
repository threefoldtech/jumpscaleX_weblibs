from Jumpscale import j
def _file_process(content,start="",end="",part=""):
    content = j.core.text.strip(content)
    if start=="" and end=="" and part=="":
        return content
    if start!="" and part!="":
        raise RuntimeError("start and part cannot be defined in include at same time")
    if part!="":
        start = part
    start = start.lower()
    out=""
    state="START"
    for line in content.split("\n"):
        lstrip = line.strip().lower()

        if lstrip.startswith(start):
            state = "FOUND"
            # prefix_space_length = len(line)-len(lstrip)  #is nr of spaces when starting the search
            # prefix_space = " "*prefix_space_length
            out+="%s\n"%line
            continue
        if state=="FOUND":
            if part != "":
                #means looking for part
                if len(line)>0 and line[0]!=" ":
                    return out
            out+="%s\n"%line
            if end!="" and lstrip.find(end.lower())!=-1:
                return out
    return out


def include(doc, name="test5",docsite="",repo="",branch="",start="",end="",part="", **args):
    name = name.lower()


    if repo!="":
        path=j.clients.git.getContentPathFromURLorPath(repo)
        key = j.data.hash.md5_string("macro_include_%s_%s"%(repo,name))

        def do(path="",name="",start="",end="",part=""):
            ext = j.sal.fs.getFileExtension(name)
            extlower = ext.lower()
            if extlower in ["","md"]:
                filt="*.md"
            else:
                filt = "*.%s"%ext
            res=[]
            tofind = name.lower()
            for item in j.sal.fs.listFilesInDir(path, recursive=True, filter=filt, followSymlinks=False, listSymlinks=False):
                if item.lower().find(tofind)!=-1:
                    res.append(item)
            if len(res)>1:
                raise RuntimeError("found more than 1 document for:%s %s"%(doc,name))
            if len(res)==0:
                raise RuntimeError("could not find document in repo:%s name:%s"%(repo,name))
            content = j.sal.fs.fileGetContents(res[0])
            content2=_file_process(content=content,start=start,end=end,part=part)

            if extlower in ["","md"]:
                return content2
            else:
                if extlower in ["py"]:
                    lang="python"
                elif extlower in ["toml"]:
                    lang="toml"
                elif extlower in ["json"]:
                    lang="json"
                elif extlower in ["yaml"]:
                    lang="yaml"
                elif extlower in ["txt"]:
                    lang="txt"
                elif extlower in ["bash","sh"]:
                    lang="bash"
                else:
                    raise RuntimeError("did not find extension to define which code language")

                content3 = content2.replace("```","'''")
                content4="```%s\n\n%s\n\n```\n\n"%(lang,content3)
            return content4

        content = j.servers.web.latest.cache.get(key, method=do, expire=600, refresh=True, path=path, name=name, start=start,end=end,part=part)
        return content

    if name.find(":") == -1:
        doc = doc.docsite.doc_get(name, die=False)
        if doc==None:
            #walk over all docsites
            res=[]
            for key,ds in j.tools.docsites.docsites.items():
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
        docsite = j.tools.docsites.docsite_get(docsiteName)
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

