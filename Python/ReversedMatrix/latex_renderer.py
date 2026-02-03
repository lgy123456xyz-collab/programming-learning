import sympy as sp

def sympy_to_html(sympy_obj):
    if isinstance(sympy_obj, dict):
        latex_content = r" \\ ".join([f"{k} = {sp.latex(v)}" for k, v in sympy_obj.items()])
    else:
        latex_content = sp.latex(sympy_obj)

    return f"""
    <html>
    <head>
        <script type="text/javascript" async src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.2.2/es5/tex-mml-chtml.js"></script>
        <style>
            body {{ 
                background: white; 
                margin: 0; 
                padding: 20px; 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                min-height: 100vh;
            }}
            .math-wrapper {{
                max-width: 100%;
                overflow-x: auto; /* 允许横向滚动，解决截断 */
                padding: 10px;
                text-align: center;
            }}
            .math {{ font-size: 1.4em; }}
        </style>
    </head>
    <body>
        <div class="math-wrapper">
            <div class="math">$${latex_content}$$</div>
        </div>
    </body>
    </html>
    """

def sympy_to_pretty(sympy_obj):
    """用于模式切换的字符画版本"""
    if isinstance(sympy_obj, dict):
        res = ""
        for k, v in sympy_obj.items():
            res += f"--- {k} ---\n{sp.pretty(v, use_unicode=True)}\n\n"
        return res
    return sp.pretty(sympy_obj, use_unicode=True)