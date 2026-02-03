import tkinter as tk

class BetSlider(tk.Frame):
    def __init__(self, parent, callback):
        super().__init__(parent, bg="#111") # 改为更深的背景区分控制区
        self.callback = callback
        self.slider = tk.Scale(self, from_=10, to=1000, orient="horizontal", 
                              bg="#111", fg="white", length=250,
                              highlightthickness=0, command=self._on_change)
        self.slider.pack(side="left", padx=5)
        self.label = tk.Label(self, text="加注: $10", bg="#111", fg="#f1c40f", width=10)
        self.label.pack(side="left")

    def _on_change(self, val):
        self.label.config(text=f"加注: ${val}")
        if self.callback: self.callback(val)

    def set_max(self, max_val):
        self.slider.config(to=max(10, max_val))